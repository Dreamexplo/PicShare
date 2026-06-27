import { NextRequest, NextResponse } from "next/server";
import { getAlbumBySlug } from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const album = await getAlbumBySlug(params.slug);
    if (!album) return NextResponse.json({ error: "相册不存在" }, { status: 404 });
    return NextResponse.json(album);
  } catch (error) {
    console.error("Get album by slug error:", error);
    return NextResponse.json({ error: "获取相册失败" }, { status: 500 });
  }
}
