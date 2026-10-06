import { NextResponse } from "next/server";
import { queryIGDB } from "@/lib/igdb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Extract front-end parameters (search query, pagination offsets, filters)
  const search = searchParams.get("search") || "";
  const limit = searchParams.get("limit") || "20";
  
  // Build IGDB's "Apicalypse" query body programmatically
  let igdbQuery = `fields name, first_release_date, summary, cover.image_id, platforms.name, total_rating; limit ${limit};`;
  
  // If the user is typing, add a search condition
  if (search) {
    igdbQuery += ` search "${search}";`;
  } else {
    // If not searching, sort by rating/release to get prime data
    igdbQuery += ` sort total_rating desc; where total_rating != null;`;
  }

  try {
    const gamesData = await queryIGDB("games", igdbQuery);
    return NextResponse.json(gamesData);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch archive data" }, { status: 500 });
  }
}