import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE fabric
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.fabric.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting fabric:', error);
    return NextResponse.json({ error: 'Failed to delete fabric' }, { status: 500 });
  }
}
