export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const images = await prisma.image.findMany({ select: { id: true, url: true, label: true } });

  if (images.length < 2) {
    return NextResponse.json({ error: "Not enough images" }, { status: 404 });
  }

  // Pick two distinct images at random
  const shuffled = images.sort(() => Math.random() - 0.5);
  const [a, b] = shuffled.slice(0, 2);

  return NextResponse.json({ image1: a, image2: b });
}
