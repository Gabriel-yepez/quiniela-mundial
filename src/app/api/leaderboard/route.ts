import { NextResponse } from "next/server";
import { getCachedLeaderboard } from "@/lib/cached-queries";

export async function GET() {
  const leaderboard = await getCachedLeaderboard();
  return NextResponse.json(leaderboard);
}
