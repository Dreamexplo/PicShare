import { NextRequest, NextResponse } from "next/server";
import { isStorageConfigured, getFile, getOriginalPath, getThumbnailPath } from "@/lib/storage";
import path from "path";
import fs from "fs";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".gif": "image/gif", ".webp": "image/webp", ".avif": "image/avif",
};

export async function GET(request: NextRequest, { params }: { params: { albumId: string; segments: string[] } }) {
  try {
    const { albumId, segments } = params;
    if (!segments || segments.length === 0) {
      return NextResponse.json({ error: "缺少文件路径" }, { status: 400 });
    }

    const isThumb = segments[0] === "thumb";
    const filename = isThumb ? segments.slice(1).join("/") : segments.join("/");
    const ext = path.extname(filename).toLowerCase();
    let buffer: Buffer | null = null;

    if (isStorageConfigured()) {
      // ---- Supabase Storage 模式 ----
      const storagePath = isThumb
        ? getThumbnailPath(albumId, filename)
        : getOriginalPath(albumId, filename);
      buffer = await getFile(storagePath);
    } else {
      // ---- 本地模式 ----
      const filePath = isThumb
        ? path.join(UPLOADS_DIR, "thumbnails", albumId, filename)
        : path.join(UPLOADS_DIR, "originals", albumId, filename);
      const resolvedPath = path.resolve(filePath);
      if (!resolvedPath.startsWith(path.resolve(UPLOADS_DIR))) {
        return NextResponse.json({ error: "非法路径" }, { status: 403 });
      }
      if (!fs.existsSync(resolvedPath)) {
        return NextResponse.json({ error: "文件不存在" }, { status: 404 });
      }
      buffer = fs.readFileSync(resolvedPath);
    }

    if (!buffer) {
      return NextResponse.json({ error: "文件不存在" }, { status: 404 });
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("File serve error:", error);
    return NextResponse.json({ error: "获取文件失败" }, { status: 500 });
  }
}
