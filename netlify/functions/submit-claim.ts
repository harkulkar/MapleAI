import { MongoClient } from 'mongodb';
import dns from 'node:dns';
import { Resolver } from 'node:dns/promises';

dns.setDefaultResultOrder('ipv4first');

const DB_NAME = 'Maple';
const COLLECTION_NAME = 'incident_intake';

let cachedClient: MongoClient | null = null;

async function toDirectMongoUri(uri: string): Promise<string> {
  if (!uri.startsWith('mongodb+srv://')) return uri;

  const parsed = new URL(uri.replace('mongodb+srv://', 'https://'));
  const hostname = parsed.hostname;
  const username = decodeURIComponent(parsed.username);
  const password = decodeURIComponent(parsed.password);

  const resolver = new Resolver();
  resolver.setServers(['8.8.8.8', '1.1.1.1']);

  const srv = await resolver.resolveSrv(`_mongodb._tcp.${hostname}`);
  const hosts = srv.map((record) => `${record.name}:${record.port || 27017}`).join(',');

  let replicaSet = '';
  let authSource = 'admin';
  try {
    const txtRecords = await resolver.resolveTxt(hostname);
    const txt = txtRecords.flat().join('&').replace(/,/g, '&');
    const txtParams = new URLSearchParams(txt);
    replicaSet = txtParams.get('replicaSet') ?? '';
    authSource = txtParams.get('authSource') ?? 'admin';
  } catch {
    // TXT lookup is optional
  }

  const query = new URLSearchParams(parsed.search);
  if (!query.has('tls') && !query.has('ssl')) query.set('tls', 'true');
  if (!query.has('authSource')) query.set('authSource', authSource);
  if (!query.has('retryWrites')) query.set('retryWrites', 'true');
  if (!query.has('w')) query.set('w', 'majority');
  if (replicaSet && !query.has('replicaSet')) query.set('replicaSet', replicaSet);

  return `mongodb://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${hosts}/?${query.toString()}`;
}

async function getMongoClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }
  if (cachedClient) {
    return cachedClient;
  }
  const directUri = await toDirectMongoUri(uri);
  const client = new MongoClient(directUri, { serverSelectionTimeoutMS: 20000 });
  await client.connect();
  cachedClient = client;
  return client;
}

export default async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const claim = await req.json();
    const client = await getMongoClient();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const result = await collection.insertOne({
      ...claim,
      _createdAt: new Date(),
    });

    return new Response(
      JSON.stringify({ success: true, insertedId: result.insertedId }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('MongoDB insert error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to save claim to database' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
};

export const config = {
  path: '/api/submit-claim',
};
