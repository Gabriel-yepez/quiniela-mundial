import { NextResponse } from "next/server";
import { getCachedGroups } from "@/lib/cached-queries";

export async function GET() {
  const groups = await getCachedGroups();
  return NextResponse.json(groups);
}
