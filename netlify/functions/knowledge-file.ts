import { fetchKnowledgeBlob, isAllowedBlobRef } from '../../server/knowledge-blobs';

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export default async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  }

  if (req.method !== 'GET') {
    return json(405, { error: 'Method not allowed' });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return json(503, { error: 'BLOB_READ_WRITE_TOKEN is not set' });
  }

  const url = new URL(req.url);
  const ref = url.searchParams.get('pathname') || url.searchParams.get('url') || '';
  const download = url.searchParams.get('download') === '1';

  if (!isAllowedBlobRef(ref)) {
    return json(400, { error: 'Invalid file reference' });
  }

  try {
    const file = await fetchKnowledgeBlob(ref, token, process.env.BLOB_STORE_ID);
    if (!file) {
      return json(404, { error: 'File not found' });
    }

    const disposition = download
      ? `attachment; filename="${file.filename.replace(/"/g, '')}"`
      : `inline; filename="${file.filename.replace(/"/g, '')}"`;

    return new Response(file.stream, {
      status: 200,
      headers: {
        'Content-Type': file.contentType,
        'Content-Length': String(file.size),
        'Content-Disposition': disposition,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Vercel Blob download error:', error);
    return json(500, { error: 'Failed to download file' });
  }
};

export const config = {
  path: '/api/knowledge-file',
};
