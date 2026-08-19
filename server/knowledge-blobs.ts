import { get, list } from '@vercel/blob'
import { Readable } from 'node:stream'
import type { ReadableStream as NodeWebReadableStream } from 'node:stream/web'

export type KnowledgeBlobFile = {
  pathname: string
  url: string
  downloadUrl: string
  size: number
  uploadedAt: string
}

export async function listKnowledgeBlobs(token: string, storeId?: string): Promise<KnowledgeBlobFile[]> {
  const files: KnowledgeBlobFile[] = []
  let cursor: string | undefined

  do {
    const result = await list({
      token,
      storeId,
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

export async function fetchKnowledgeBlob(ref: string, token: string, storeId?: string) {
  const result = await get(ref, {
    access: 'private',
    token,
    storeId,
  })
  if (!result || result.statusCode !== 200 || !result.stream) {
    return null
  }
  const filename = decodeURIComponent((result.blob.pathname.split('/').pop() || 'download').replace(/\+/g, ' '))
  return {
    stream: result.stream,
    contentType: result.blob.contentType || 'application/octet-stream',
    size: result.blob.size,
    filename,
  }
}

export function nodeStreamFromWeb(stream: ReadableStream<Uint8Array>) {
  return Readable.fromWeb(stream as NodeWebReadableStream)
}
