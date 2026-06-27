import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || "";

let client: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!client) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        "Missing Supabase env vars. Set SUPABASE_URL and SUPABASE_SERVICE_KEY (or SUPABASE_ANON_KEY) in .env.local"
      );
    }
    client = createClient(supabaseUrl, supabaseKey);
  }
  return client;
}

export interface Album {
  id: string;
  slug: string;
  title: string;
  description: string;
  layout_type: "masonry" | "grid" | "book";
  password: string | null;
  cover_image: string | null;
  custom_options: string;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  album_id: string;
  filename: string;
  original_name: string;
  thumbnail_name: string | null;
  width: number;
  height: number;
  file_size: number;
  sort_order: number;
  created_at: string;
}

export async function listAlbums(): Promise<Album[]> {
  const { data, error } = await getSupabase()
    .from("albums")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error("listAlbums: " + error.message);
  return (data as Album[]) || [];
}

export async function getAlbum(id: string): Promise<Album | null> {
  const { data, error } = await getSupabase()
    .from("albums")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("getAlbum: " + error.message);
  return data as Album | null;
}

export async function getAlbumBySlug(slug: string): Promise<Album | null> {
  const { data, error } = await getSupabase()
    .from("albums")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error("getAlbumBySlug: " + error.message);
  return data as Album | null;
}

export async function createAlbum(fields: {
  id: string;
  slug: string;
  title: string;
  description?: string;
  layout_type?: string;
  password?: string | null;
  custom_options?: string;
}): Promise<Album> {
  const { data, error } = await getSupabase()
    .from("albums")
    .insert({
      id: fields.id,
      slug: fields.slug,
      title: fields.title,
      description: fields.description || "",
      layout_type: fields.layout_type || "masonry",
      password: fields.password || null,
      custom_options: fields.custom_options || "{}",
    })
    .select()
    .single();
  if (error) throw new Error("createAlbum: " + error.message);
  return data as Album;
}

export async function updateAlbum(
  id: string,
  fields: Partial<{
    title: string;
    description: string;
    layout_type: string;
    password: string | null;
    custom_options: string;
  }>
): Promise<Album | null> {
  const updates: any = { ...fields, updated_at: new Date().toISOString() };
  if (fields.password === undefined) delete updates.password;

  const { data, error } = await getSupabase()
    .from("albums")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error("updateAlbum: " + error.message);
  return data as Album | null;
}

export async function deleteAlbum(id: string): Promise<boolean> {
  const { error } = await getSupabase().from("albums").delete().eq("id", id);
  if (error) throw new Error("deleteAlbum: " + error.message);
  return true;
}

export async function listPhotos(albumId: string): Promise<Photo[]> {
  const { data, error } = await getSupabase()
    .from("photos")
    .select("*")
    .eq("album_id", albumId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error("listPhotos: " + error.message);
  return (data as Photo[]) || [];
}

export async function createPhoto(fields: {
  id: string;
  album_id: string;
  filename: string;
  original_name: string;
  thumbnail_name: string | null;
  width: number;
  height: number;
  file_size: number;
  sort_order?: number;
}): Promise<Photo> {
  const { data, error } = await getSupabase()
    .from("photos")
    .insert({ ...fields, sort_order: fields.sort_order || 0 })
    .select()
    .single();
  if (error) throw new Error("createPhoto: " + error.message);
  return data as Photo;
}