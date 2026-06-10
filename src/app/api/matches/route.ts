import { NextResponse } from "next/server";
import { getCachedMatches } from "@/lib/cached-queries";

export async function GET() {
  const matches = await getCachedMatches();
  return NextResponse.json(matches);
}
