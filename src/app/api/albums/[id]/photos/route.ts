import { NextRequest, NextResponse } from "next/server";
import { listPhotos } from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const photos = await listPhotos(params.id);
    return NextResponse.json(photos);
  } catch (error) {
    console.error("List photos error:", error);
    return NextResponse.json({ error: "获取照片列表失败" }, { status: 500 });
  }
}
