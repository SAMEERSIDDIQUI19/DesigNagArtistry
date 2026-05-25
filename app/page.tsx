import { promises as fs } from 'fs';
import path from 'path';
import HomeClient from './HomeClient';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const CONTENT_FILE = path.join(process.cwd(), 'data', 'home-content.json');
const CONTENT_KEY = 'home';

async function getHomeContent() {
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS site_content (
        key TEXT PRIMARY KEY,
        content JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    const rows = await prisma.$queryRaw<{ content: unknown }[]>`
      SELECT content FROM site_content WHERE key = ${CONTENT_KEY} LIMIT 1
    `;
    if (Array.isArray(rows) && rows.length > 0) {
      return rows[0].content;
    }
  } catch {
    // DB unavailable or table missing — fall through to JSON
  }

  try {
    const raw = await fs.readFile(CONTENT_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default async function Home() {
  const content = await getHomeContent();
  return <HomeClient initialContent={content} />;
}
