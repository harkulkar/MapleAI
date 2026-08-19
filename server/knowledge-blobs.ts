import { get, list } from '@vercel/blob'

export type KnowledgeBlobFile = {
  pathname: string
  url: string
  downloadUrl: string
  size: number
  uploadedAt: string
}

function cleanEnv(value?: string) {
  const trimmed = value?.trim()
  if (!trimmed) return undefined
  return trimmed.replace(/^["']|["']$/g, '')
}

function blobAuth(token?: string, storeId?: string) {
  const options: { token?: string; storeId?: string } = {}
  const cleanedToken = cleanEnv(token)
  const cleanedStoreId = cleanEnv(storeId)
  const oidc = cleanEnv(process.env.VERCEL_OIDC_TOKEN)

  // On Vercel, OIDC is preferred. A stale BLOB_READ_WRITE_TOKEN from a failed
  // dashboard "token update" would override OIDC and cause production 403s.
  if (!oidc && cleanedToken) options.token = cleanedToken
  if (cleanedStoreId) options.storeId = cleanedStoreId
  return options
}

export async function listKnowledgeBlobs(token?: string, storeId?: string): Promise<KnowledgeBlobFile[]> {
  try {
    return await listAllBlobs(blobAuth(token, storeId))
  } catch (error) {
    const cleanedToken = cleanEnv(token)
    if (cleanedToken && process.env.VERCEL_OIDC_TOKEN) {
      return await listAllBlobs({ token: cleanedToken, storeId: cleanEnv(storeId) })
    }
    throw error
  }
}

async function listAllBlobs(auth: { token?: string; storeId?: string }): Promise<KnowledgeBlobFile[]> {
  const files: KnowledgeBlobFile[] = []
  let cursor: string | undefined

  do {
    const result = await list({
      ...auth,
      cursor,
      limit: 1000,
    })
    for (const blob of result.blobs) {
      files.push({
        pathname: blob.pathname,
        url: blob.url,
        downloadUrl: blob.downloadUrl,
        size: blob.size,
        uploadedAt: blob.uploadedAt instanceof Date ? blob.uploadedAt.toISOString() : String(blob.uploadedAt),
      })
    }
    cursor = result.cursor
  } while (cursor)

  return files
}

export function isAllowedBlobRef(ref: string): boolean {
  if (!ref || ref.includes('..')) return false
  if (ref.startsWith('http://') || ref.startsWith('https://')) {
    try {
      const host = new URL(ref).hostname
      return host.endsWith('.blob.vercel-storage.com') || host === 'blob.vercel-storage.com'
    } catch {
      return false
    }
  }
  return true
}

export async function fetchKnowledgeBlob(ref: string, token?: string, storeId?: string) {
  const result = await get(ref, {
    access: 'private',
    ...blobAuth(token, storeId),
  })
  if (!result || result.statusCode !== 200 || !result.stream) {
    return null
  }
  const filename = decodeURIComponent((result.blob.pathname.split('/').pop() || 'download').replace(/\+/g, ' '))
  const bytes = new Uint8Array(await new Response(result.stream).arrayBuffer())
  return {
    bytes,
    contentType: result.blob.contentType || 'application/octet-stream',
    size: result.blob.size || bytes.byteLength,
    filename,
  }
}

export function decodeBlobParam(value: string | null | undefined) {
  if (!value) return ''
  try {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/')
    const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
    return Buffer.from(padded + pad, 'base64').toString('utf8')
  } catch {
    return ''
  }
}
