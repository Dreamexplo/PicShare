import { NextRequest, NextResponse } from "next/server";
import { listAlbums, createAlbum } from "@/lib/db";
import { generateId, generateSlug } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, layout_type, password, custom_options } = body;
    if (!title || !title.trim()) {
      return NextResponse.json({ error: "相册标题不能为空" }, { status: 400 });
    }

    const album = await createAlbum({
      id: generateId(),
      slug: generateSlug(),
      title: title.trim(),
      description: description || "",
      layout_type: layout_type || "masonry",
      password: password || null,
      custom_options: custom_options || "{}",
    });

    return NextResponse.json(album, { status: 201 });
  } catch (error) {
    console.error("Create album error:", error);
    return NextResponse.json({ error: "创建相册失败" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const albums = await listAlbums();
    return NextResponse.json(albums);
  } catch (error) {
    console.error("List albums error:", error);
    return NextResponse.json({ error: "获取相册列表失败" }, { status: 500 });
  }
}
