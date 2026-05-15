import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper function to get all category IDs including children
async function getAllCategoryIds(categoryId: string): Promise<string[]> {
  const categoryIds: string[] = [categoryId];
  
  // Find all child categories recursively
  const findChildren = async (parentId: string) => {
    const children = await prisma.category.findMany({
      where: { parentId },
      select: { id: true },
    });
    
    for (const child of children) {
      categoryIds.push(child.id);
      await findChildren(child.id);
    }
  };
  
  await findChildren(categoryId);
  return categoryIds;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const category = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "newest";
    const search = searchParams.get("search") || "";

    console.log("API Request - Category ID:", category);

    const pageSize = 12;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {
      status: "active",
    };

    if (category) {
      // Get all category IDs including children
      try {
        const categoryIds = await getAllCategoryIds(category);
        console.log("Filtering by category IDs:", categoryIds);
        where.categoryId = {
          in: categoryIds,
        };
      } catch (error) {
        console.error("Error getting category IDs:", error);
        // Fallback to single category ID if recursive function fails
        where.categoryId = category;
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build order by
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-low") {
      orderBy = { price: "asc" };
    } else if (sort === "price-high") {
      orderBy = { price: "desc" };
    } else if (sort === "name") {
      orderBy = { name: "asc" };
    }

    // Fetch products
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
          images: {
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    console.log("Products found:", products.length, "Total:", totalCount);
    console.log("Sample product:", JSON.stringify(products[0], null, 2));

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      products,
      totalPages,
      currentPage: page,
      totalCount,
    });
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
