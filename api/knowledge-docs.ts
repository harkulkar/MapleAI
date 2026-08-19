import { listKnowledgeBlobs } from '../server/knowledge-blobs';

type VercelReq = {
  method?: string;
};

type VercelRes = {
  status: (code: number) => VercelRes;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
};

export default async function handler(req: VercelReq, res: VercelRes) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed', files: [] });
    return;
  }

  try {
    const files = await listKnowledgeBlobs(process.env.BLOB_READ_WRITE_TOKEN, process.env.BLOB_STORE_ID);
    res.status(200).json({ files });
  } catch (error) {
    console.error('Vercel Blob list error:', error);
    const message = error instanceof Error ? error.message : 'Failed to load documents from Vercel Blob';
    res.status(500).json({ error: message, files: [] });
  }
}
