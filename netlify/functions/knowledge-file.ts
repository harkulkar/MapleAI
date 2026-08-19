import { fetchKnowledgeBlob, isAllowedBlobRef, decodeBlobParam } from '../../server/knowledge-blobs';

type NetlifyEvent = {
  httpMethod: string;
  queryStringParameters?: Record<string, string> | null;
  body?: string | null;
  isBase64Encoded?: boolean;
};

function json(status: number, body: unknown) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function parseRequest(event: NetlifyEvent) {
  let pathname = '';
  let fileUrl = '';
  let download = false;

  if (event.httpMethod === 'POST' && event.body) {
    const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
    const data = JSON.parse(raw) as { pathname?: string; url?: string; download?: boolean };
    pathname = data.pathname || '';
    fileUrl = data.url || '';
    download = Boolean(data.download);
  } else {
    const query = event.queryStringParameters || {};
    pathname = decodeBlobParam(query.p) || query.pathname || '';
    fileUrl = query.url || '';
    download = query.download === '1';
  }

  return { ref: fileUrl || pathname, download };
}

export const handler = async (event: NetlifyEvent) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' }, body: '' };
  }

  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return json(503, { error: 'BLOB_READ_WRITE_TOKEN is not set' });
  }

  let ref = '';
  let download = false;
  try {
    ({ ref, download } = parseRequest(event));
  } catch {
    return json(400, { error: 'Invalid request body' });
  }

  if (!isAllowedBlobRef(ref)) {
    return json(400, { error: 'Invalid file reference' });
  }

  try {
    const file = await fetchKnowledgeBlob(ref, token, process.env.BLOB_STORE_ID);
    if (!file) {
      return json(404, { error: 'File not found' });
    }

    const safeName = file.filename.replace(/"/g, '');
    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        'Content-Type': file.contentType,
        'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${safeName}"`,
        'Cache-Control': 'private, max-age=60',
      },
      body: Buffer.from(file.bytes).toString('base64'),
    };
  } catch (error) {
    console.error('Vercel Blob download error:', error);
    return json(500, { error: 'Failed to download file' });
  }
};
