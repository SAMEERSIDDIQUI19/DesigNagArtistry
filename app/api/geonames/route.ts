import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const country = searchParams.get("country");

    if (!q) {
      return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
    }

    const response = await fetch(
      `http://api.geonames.org/searchJSON?q=${encodeURIComponent(q)}&country=${country || ""}&maxRows=850&username=sameer_ahmed`,
      {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GeoNames API returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GeoNames API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch location data" },
      { status: 500 }
    );
  }
}
