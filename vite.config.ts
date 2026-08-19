import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import dns from 'node:dns'
import { Resolver } from 'node:dns/promises'
import type { IncomingMessage, ServerResponse } from 'http'
import { MongoClient } from 'mongodb'
import { listKnowledgeBlobs, fetchKnowledgeBlob, isAllowedBlobRef, decodeBlobParam } from './server/knowledge-blobs.ts'

dns.setDefaultResultOrder('ipv4first')

const DB_NAME = 'Maple'
const COLLECTION_NAME = 'incident_intake'

let cachedClient: MongoClient | null = null

/** Convert mongodb+srv:// to mongodb:// using public DNS so Windows SRV lookups don't fail. */
async function toDirectMongoUri(uri: string): Promise<string> {
  if (!uri.startsWith('mongodb+srv://')) return uri

  const parsed = new URL(uri.replace('mongodb+srv://', 'https://'))
  const hostname = parsed.hostname
  const username = decodeURIComponent(parsed.username)
  const password = decodeURIComponent(parsed.password)

  const resolver = new Resolver()
  resolver.setServers(['8.8.8.8', '1.1.1.1'])

  const srv = await resolver.resolveSrv(`_mongodb._tcp.${hostname}`)
  const hosts = srv.map((record) => `${record.name}:${record.port || 27017}`).join(',')

  let replicaSet = ''
  let authSource = 'admin'
  try {
    const txtRecords = await resolver.resolveTxt(hostname)
    const txt = txtRecords.flat().join('&').replace(/,/g, '&')
    const txtParams = new URLSearchParams(txt)
    replicaSet = txtParams.get('replicaSet') ?? ''
    authSource = txtParams.get('authSource') ?? 'admin'
  } catch {
    // TXT lookup is optional
  }

  const query = new URLSearchParams(parsed.search)
  if (!query.has('tls') && !query.has('ssl')) query.set('tls', 'true')
  if (!query.has('authSource')) query.set('authSource', authSource)
  if (!query.has('retryWrites')) query.set('retryWrites', 'true')
  if (!query.has('w')) query.set('w', 'majority')
  if (replicaSet && !query.has('replicaSet')) query.set('replicaSet', replicaSet)

  return `mongodb://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${hosts}/?${query.toString()}`
}

async function getMongoClient(uri: string): Promise<MongoClient> {
  if (cachedClient) {
    return cachedClient
  }
  const directUri = await toDirectMongoUri(uri)
  const client = new MongoClient(directUri, { serverSelectionTimeoutMS: 20000 })
  await client.connect()
  cachedClient = client
  return client
}

const mapleApiPlugin = (mongoUri: string, blobToken: string, blobStoreId?: string): Plugin => ({
  name: 'maple-api-plugin',
  configureServer(server) {
    server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
      const pathname = req.url?.split('?')[0] ?? ''

      if (pathname === '/api/knowledge-docs' && req.method === 'GET') {
        void (async () => {
          try {
            if (!blobToken) {
              res.statusCode = 503
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'BLOB_READ_WRITE_TOKEN is not set', files: [] }))
              return
            }
            const files = await listKnowledgeBlobs(blobToken, blobStoreId)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ files }))
          } catch (err) {
            console.error('[Vercel Blob] Failed to list documents:', err)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Failed to load documents from Vercel Blob', files: [] }))
          }
        })()
        return
      }

      if (pathname === '/api/knowledge-file' && (req.method === 'GET' || req.method === 'POST')) {
        void (async () => {
          try {
            if (!blobToken) {
              res.statusCode = 503
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'BLOB_READ_WRITE_TOKEN is not set' }))
              return
            }

            let ref = ''
            let download = false
            if (req.method === 'POST') {
              const raw = await new Promise<string>((resolve, reject) => {
                let body = ''
                req.on('data', (chunk: Buffer) => { body += chunk.toString() })
                req.on('end', () => resolve(body))
                req.on('error', reject)
              })
              const data = JSON.parse(raw || '{}') as { pathname?: string; url?: string; download?: boolean }
              ref = data.url || data.pathname || ''
              download = Boolean(data.download)
            } else {
              const query = new URL(req.url ?? '', 'http://localhost').searchParams
              ref = decodeBlobParam(query.get('p')) || query.get('url') || query.get('pathname') || ''
              download = query.get('download') === '1'
            }

            if (!isAllowedBlobRef(ref)) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Invalid file reference' }))
              return
            }
            const file = await fetchKnowledgeBlob(ref, blobToken, blobStoreId)
            if (!file) {
              res.statusCode = 404
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'File not found' }))
              return
            }
            const safeName = file.filename.replace(/"/g, '')
            res.statusCode = 200
            res.setHeader('Content-Type', file.contentType)
            res.setHeader('Content-Length', String(file.bytes.byteLength))
            res.setHeader(
              'Content-Disposition',
              `${download ? 'attachment' : 'inline'}; filename="${safeName}"`
            )
            res.end(Buffer.from(file.bytes))
          } catch (err) {
            console.error('[Vercel Blob] Failed to download file:', err)
            if (!res.headersSent) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Failed to download file' }))
            } else {
              res.destroy()
            }
          }
        })()
        return
      }

      if (req.url === '/api/submit-claim' && req.method === 'POST') {
        let body = ''
        req.on('data', (chunk: Buffer) => {
          body += chunk.toString()
        })
        req.on('end', async () => {
          try {
            const claim = JSON.parse(body)

            const filePath = path.resolve(import.meta.dirname, 'data', 'submitted-claims.json')
            let claims: unknown[] = []
            if (fs.existsSync(filePath)) {
              try {
                claims = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
              } catch {
                claims = []
              }
            }
            claims.push(claim)
            if (!fs.existsSync(path.resolve(import.meta.dirname, 'data'))) {
              fs.mkdirSync(path.resolve(import.meta.dirname, 'data'))
            }
            fs.writeFileSync(filePath, JSON.stringify(claims, null, 2))

            if (!mongoUri) {
              throw new Error('MONGODB_URI is not set')
            }

            const client = await getMongoClient(mongoUri)
            const db = client.db(DB_NAME)
            const collection = db.collection(COLLECTION_NAME)
            const result = await collection.insertOne({
              ...claim,
              _createdAt: new Date(),
            })
            console.log(`[MongoDB] Claim ${claim.claimId} saved to ${DB_NAME}.${COLLECTION_NAME}`)

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true, insertedId: result.insertedId }))
          } catch (err) {
            console.error('[MongoDB] Failed to save claim:', err)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Failed to save claim to database' }))
          }
        })
      } else {
        next()
      }
    })
  },
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const mongoUri = env.MONGODB_URI
  const blobToken = env.BLOB_READ_WRITE_TOKEN
  const blobStoreId = env.BLOB_STORE_ID

  return {
    plugins: [
      react(),
      tailwindcss(),
      mapleApiPlugin(mongoUri, blobToken, blobStoreId),
    ],
    server: {
      watch: {
        ignored: ['**/data/submitted-claims.json'],
      },
    },
  }
})
