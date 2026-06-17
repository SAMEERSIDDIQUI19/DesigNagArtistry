import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
    });

    console.log("Fetched categories:", categories.map(c => ({ id: c.id, name: c.name, parentId: c.parentId })));

    // Build hierarchical structure
    const categoryMap = new Map();
    const rootCategories: Array<{
      id: string;
      name: string;
      slug: string;
      image: string | null;
      parentId: string | null;
      children: Array<{
        id: string;
        name: string;
        slug: string;
        image: string | null;
        parentId: string | null;
        children: Array<unknown>;
      }>;
    }> = [];

    // First pass: create map of all categories
    categories.forEach((category) => {
      categoryMap.set(category.id, {
        id: category.id,
        name: category.name,
        slug: category.slug,
        image: category.image,
        parentId: category.parentId,
        children: [],
      });
    });

    // Second pass: build hierarchy
    categories.forEach((category) => {
      const node = categoryMap.get(category.id);
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          console.log(`Parent ${category.parentId} not found for category ${category.name}, adding to root`);
          rootCategories.push(node);
        }
      } else {
        rootCategories.push(node);
      }
    });

    console.log("Hierarchical categories:", JSON.stringify(rootCategories, null, 2));

    return NextResponse.json(rootCategories, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    console.error("Categories fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
