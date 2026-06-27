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
      return NextResponse.json({ error: "missing file path" }, { status: 400 });
    }

    const isThumb = segments[0] === "thumb";
    const filename = isThumb ? segments.slice(1).join("/") : segments.join("/");
    const ext = path.extname(filename).toLowerCase();
    let buffer: Buffer | null = null;

    if (isStorageConfigured()) {
      const storagePath = isThumb
        ? getThumbnailPath(albumId, filename)
        : getOriginalPath(albumId, filename);
      buffer = await getFile(storagePath);
    } else {
      const filePath = isThumb
        ? path.join(UPLOADS_DIR, "thumbnails", albumId, filename)
        : path.join(UPLOADS_DIR, "originals", albumId, filename);
      const resolvedPath = path.resolve(filePath);
      if (!resolvedPath.startsWith(path.resolve(UPLOADS_DIR))) {
        return NextResponse.json({ error: "invalid path" }, { status: 403 });
      }
      if (!fs.existsSync(resolvedPath)) {
        return NextResponse.json({ error: "file not found" }, { status: 404 });
      }
      buffer = fs.readFileSync(resolvedPath);
    }

    if (!buffer) {
      return NextResponse.json({ error: "file not found" }, { status: 404 });
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("File serve error:", error);
    return NextResponse.json({ error: "failed to get file" }, { status: 500 });
  }
}