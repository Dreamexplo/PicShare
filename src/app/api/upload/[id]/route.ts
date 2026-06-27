import { NextRequest, NextResponse } from "next/server";
import { getAlbum, createPhoto } from "@/lib/db";
import { generateId } from "@/lib/utils";
import { uploadOriginal, uploadThumbnail, isStorageConfigured } from "@/lib/storage";
import sharp from "sharp";
import path from "path";
import fs from "fs";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const album = await getAlbum(params.id);
    if (!album) return NextResponse.json({ error: "相册不存在" }, { status: 404 });

    const formData = await request.formData();
    const files = formData.getAll("photos") as File[];
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "未上传任何图片" }, { status: 400 });
    }

    const usingCloud = isStorageConfigured();
    const results = [];

    if (!usingCloud) {
      [path.join(UPLOADS_DIR, "originals", params.id), path.join(UPLOADS_DIR, "thumbnails", params.id)].forEach((dir) => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      });
    }

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const photoId = generateId();
      const ext = path.extname(file.name) || ".jpg";
      const filename = `${photoId}${ext}`;
      const thumbnailName = `${photoId}_thumb${ext}`;

      let width = 0, height = 0;
      let thumbBuffer: Buffer | null = null;
      try {
        const metadata = await sharp(buffer).metadata();
        width = metadata.width || 0;
        height = metadata.height || 0;
        thumbBuffer = await sharp(buffer)
          .resize(400, 400, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
      } catch (sharpErr) {
        console.error("Sharp error:", sharpErr);
        thumbBuffer = buffer;
      }

      if (usingCloud) {
        // ---- Supabase Storage 模式 ----
        await uploadOriginal(params.id, filename, buffer, file.type || "image/jpeg");
        if (thumbBuffer) await uploadThumbnail(params.id, thumbnailName, thumbBuffer);
      } else {
        // ---- 本地模式 ----
        fs.writeFileSync(path.join(UPLOADS_DIR, "originals", params.id, filename), buffer);
        if (thumbBuffer) fs.writeFileSync(path.join(UPLOADS_DIR, "thumbnails", params.id, thumbnailName), thumbBuffer);
      }

      await createPhoto({
        id: photoId,
        album_id: params.id,
        filename,
        original_name: file.name,
        thumbnail_name: thumbnailName,
        width,
        height,
        file_size: buffer.length,
      });

      results.push({ id: photoId, filename, original_name: file.name, thumbnail_name: thumbnailName });
    }

    return NextResponse.json({ photos: results, count: results.length }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "上传失败: " + (error as Error).message }, { status: 500 });
  }
}
