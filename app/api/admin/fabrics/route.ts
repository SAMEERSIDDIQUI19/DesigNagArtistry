import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all fabrics
export async function GET() {
  try {
    const fabrics = await prisma.fabric.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(fabrics);
  } catch (error) {
    console.error('Error fetching fabrics:', error);
    return NextResponse.json({ error: 'Failed to fetch fabrics' }, { status: 500 });
  }
}

// POST create new fabric
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const fabric = await prisma.fabric.create({
      data: { name },
    });

    return NextResponse.json(fabric, { status: 201 });
  } catch (error) {
    console.error('Error creating fabric:', error);
    return NextResponse.json({ error: 'Failed to create fabric' }, { status: 500 });
  }
}
