import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || "";
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "picshare";

function getClient() {
  return createClient(supabaseUrl, supabaseKey);
}

/** 检查 Supabase 存储是否已配置 */
export function isStorageConfigured(): boolean {
  return !!(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY));
}

/** 上传原图 */
export async function uploadOriginal(
  albumId: string,
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const path = `originals/${albumId}/${filename}`;
  const { error } = await getClient()
    .storage.from(BUCKET)
    .upload(path, buffer, { contentType, upsert: true });
  if (error) throw new Error(`上传原图失败: ${error.message}`);
  return path;
}

/** 上传缩略图 */
export async function uploadThumbnail(
  albumId: string,
  filename: string,
  buffer: Buffer
): Promise<string> {
  const path = `thumbnails/${albumId}/${filename}`;
  const { error } = await getClient()
    .storage.from(BUCKET)
    .upload(path, buffer, { contentType: "image/jpeg", upsert: true });
  if (error) throw new Error(`上传缩略图失败: ${error.message}`);
  return path;
}

/** 从存储读取文件 */
export async function getFile(storagePath: string): Promise<Buffer | null> {
  const { data, error } = await getClient()
    .storage.from(BUCKET)
    .download(storagePath);
  if (error || !data) {
    console.error("读取文件失败:", error?.message || "data is null");
    return null;
  }
  return Buffer.from(await data.arrayBuffer());
}

/** 构建存储路径 */
export function getOriginalPath(albumId: string, filename: string): string {
  return `originals/${albumId}/${filename}`;
}
export function getThumbnailPath(albumId: string, filename: string): string {
  return `thumbnails/${albumId}/${filename}`;
}

/** 获取公开 URL（如果 bucket 设为公开） */
export function getPublicUrl(storagePath: string): string {
  const { data } = getClient().storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}
