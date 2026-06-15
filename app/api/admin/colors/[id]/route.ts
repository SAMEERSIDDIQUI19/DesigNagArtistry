import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE color
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.color.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting color:', error);
    return NextResponse.json({ error: 'Failed to delete color' }, { status: 500 });
  }
}
