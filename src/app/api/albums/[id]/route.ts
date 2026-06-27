import { NextRequest, NextResponse } from "next/server";
import { getAlbum, updateAlbum, deleteAlbum } from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const album = await getAlbum(params.id);
    if (!album) return NextResponse.json({ error: "相册不存在" }, { status: 404 });
    return NextResponse.json(album);
  } catch (error) {
    console.error("Get album error:", error);
    return NextResponse.json({ error: "获取相册失败" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const existing = await getAlbum(params.id);
    if (!existing) return NextResponse.json({ error: "相册不存在" }, { status: 404 });

    const body = await request.json();
    const album = await updateAlbum(params.id, {
      title: body.title ?? existing.title,
      description: body.description ?? existing.description,
      layout_type: body.layout_type ?? existing.layout_type,
      password: body.password !== undefined ? body.password : existing.password,
      custom_options: body.custom_options ?? existing.custom_options,
    });

    return NextResponse.json(album);
  } catch (error) {
    console.error("Update album error:", error);
    return NextResponse.json({ error: "更新相册失败" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ok = await deleteAlbum(params.id);
    if (!ok) return NextResponse.json({ error: "相册不存在" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete album error:", error);
    return NextResponse.json({ error: "删除相册失败" }, { status: 500 });
  }
}
