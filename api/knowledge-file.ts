import { fetchKnowledgeBlob, isAllowedBlobRef, decodeBlobParam } from '../server/knowledge-blobs';

type VercelReq = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  body?: { pathname?: string; url?: string; download?: boolean };
};

type VercelRes = {
  status: (code: number) => VercelRes;
  json: (body: unknown) => void;
  send: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
};

function queryValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}

export const config = {
  maxDuration: 10,
};

export default async function handler(req: VercelReq, res: VercelRes) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let pathname = '';
  let fileUrl = '';
  let download = false;

  if (req.method === 'POST') {
    pathname = req.body?.pathname || '';
    fileUrl = req.body?.url || '';
    download = Boolean(req.body?.download);
  } else {
    const query = req.query || {};
    pathname = decodeBlobParam(queryValue(query.p)) || queryValue(query.pathname);
    fileUrl = queryValue(query.url);
    download = queryValue(query.download) === '1';
  }

  const ref = fileUrl || pathname;
  if (!isAllowedBlobRef(ref)) {
    res.status(400).json({ error: 'Invalid file reference' });
    return;
  }

  try {
    const file = await fetchKnowledgeBlob(ref, process.env.BLOB_READ_WRITE_TOKEN, process.env.BLOB_STORE_ID);
    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    const safeName = file.filename.replace(/"/g, '');
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `${download ? 'attachment' : 'inline'}; filename="${safeName}"`);
    res.setHeader('Cache-Control', 'private, max-age=60');
    res.status(200).send(Buffer.from(file.bytes));
  } catch (error) {
    console.error('Vercel Blob download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
}
