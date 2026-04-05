import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

function isAdminAuthed(req: NextRequest): boolean {
  const password = req.headers.get("x-admin-password");
  return password === process.env.ADMIN_PASSWORD;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const image = await prisma.image.findUnique({ where: { id: params.id } });
  if (!image) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await del(image.url);
  await prisma.image.delete({ where: { id: params.id } });

  return new NextResponse(null, { status: 204 });
}
