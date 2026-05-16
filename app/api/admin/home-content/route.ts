import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from 'fs';
import path from 'path';
import { prisma } from "@/lib/prisma";

const CONTENT_FILE = path.join(process.cwd(), 'data', 'home-content.json');
const CONTENT_KEY = 'home';

async function ensureSiteContentTable() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      content JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function GET() {
  try {
    await ensureSiteContentTable();
    const rows = await prisma.$queryRaw<{ content: unknown }[]>`
      SELECT content FROM site_content WHERE key = ${CONTENT_KEY} LIMIT 1
    `;

    if (rows.length > 0) {
      return NextResponse.json(rows[0].content);
    }

    const data = await fs.readFile(CONTENT_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Home content read error:', error);
    return NextResponse.json({ error: 'Failed to read home content' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const content = await request.json();
    const contentJson = JSON.stringify(content);
    await ensureSiteContentTable();
    await prisma.$executeRaw`
      INSERT INTO site_content (key, content, updated_at)
      VALUES (${CONTENT_KEY}, CAST(${contentJson} AS JSONB), NOW())
      ON CONFLICT (key)
      DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Home content update error:', error);
    return NextResponse.json({ error: 'Failed to update home content' }, { status: 500 });
  }
}
