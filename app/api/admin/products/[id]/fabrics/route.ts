import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT update product fabrics
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { fabricIds } = body;

    // Delete existing product fabrics
    await prisma.productFabric.deleteMany({
      where: { productId: params.id },
    });

    // Create new product fabrics
    if (fabricIds && fabricIds.length > 0) {
      await prisma.productFabric.createMany({
        data: fabricIds.map((fabricId: string) => ({
          productId: params.id,
          fabricId,
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating product fabrics:', error);
    return NextResponse.json({ error: 'Failed to update product fabrics' }, { status: 500 });
  }
}
