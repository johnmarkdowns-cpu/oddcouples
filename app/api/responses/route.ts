import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePair } from "@/lib/pairKey";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { image1Id, image2Id, movieTitle, tmdbId, tmdbPoster } = body;

  if (!image1Id || !image2Id || !movieTitle?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const [id1, id2] = normalizePair(image1Id, image2Id);

  const response = await prisma.response.create({
    data: {
      image1Id: id1,
      image2Id: id2,
      movieTitle: movieTitle.trim(),
      tmdbId: tmdbId ?? null,
      tmdbPoster: tmdbPoster ?? null,
    },
  });

  return NextResponse.json(response, { status: 201 });
}
