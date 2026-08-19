/// <reference types="node" />
import { MongoClient } from 'mongodb';

type VercelReq = {
  method?: string;
  body?: unknown;
};

type VercelRes = {
  status: (code: number) => VercelRes;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
};

const DB_NAME = 'Maple';
const COLLECTION_NAME = 'incident_intake';

let cachedClient: MongoClient | null = null;

async function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }
  if (cachedClient) {
    return cachedClient;
  }
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 20000 });
  await client.connect();
  cachedClient = client;
  return client;
}

export default async function handler(req: VercelReq, res: VercelRes) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const claim = req.body;
    const client = await getMongoClient();
    const result = await client.db(DB_NAME).collection(COLLECTION_NAME).insertOne({
      ...(claim as object),
      _createdAt: new Date(),
    });
    res.status(200).json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    console.error('MongoDB insert error:', error);
    res.status(500).json({ error: 'Failed to save claim to database' });
  }
}
