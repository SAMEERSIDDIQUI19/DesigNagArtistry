import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT update product colors
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { colorIds } = body;

    // Delete existing product colors
    await prisma.productColor.deleteMany({
      where: { productId: params.id },
    });

    // Create new product colors
    if (colorIds && colorIds.length > 0) {
      await prisma.productColor.createMany({
        data: colorIds.map((colorId: string) => ({
          productId: params.id,
          colorId,
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating product colors:', error);
    return NextResponse.json({ error: 'Failed to update product colors' }, { status: 500 });
  }
}
