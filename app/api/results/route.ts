export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePair } from "@/lib/pairKey";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const image1Id = searchParams.get("image1Id");
  const image2Id = searchParams.get("image2Id");

  if (!image1Id || !image2Id) {
    return NextResponse.json({ error: "Missing image IDs" }, { status: 400 });
  }

  const [id1, id2] = normalizePair(image1Id, image2Id);

  const responses = await prisma.response.findMany({
    where: { image1Id: id1, image2Id: id2 },
    select: { movieTitle: true, tmdbId: true, tmdbPoster: true },
  });

  // Aggregate by tmdbId (or movieTitle as fallback) and count
  const counts = new Map<
    string,
    { movieTitle: string; tmdbId: number | null; tmdbPoster: string | null; count: number }
  >();

  for (const r of responses) {
    const key = r.tmdbId ? String(r.tmdbId) : r.movieTitle.toLowerCase();
    const existing = counts.get(key);
    if (existing) {
      existing.count++;
    } else {
      counts.set(key, {
        movieTitle: r.movieTitle,
        tmdbId: r.tmdbId,
        tmdbPoster: r.tmdbPoster,
        count: 1,
      });
    }
  }

  const ranked = Array.from(counts.values()).sort((a, b) => b.count - a.count);

  return NextResponse.json({ total: responses.length, results: ranked });
}
