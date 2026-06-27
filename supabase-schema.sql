-- ============================================
-- PicShare Supabase Database Schema
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Create albums table
CREATE TABLE IF NOT EXISTS albums (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  layout_type TEXT DEFAULT 'masonry' CHECK(layout_type IN ('masonry','grid','book')),
  password TEXT DEFAULT NULL,
  cover_image TEXT DEFAULT NULL,
  custom_options TEXT DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  album_id TEXT NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  thumbnail_name TEXT DEFAULT NULL,
  width INTEGER DEFAULT 0,
  height INTEGER DEFAULT 0,
  file_size INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_photos_album_id ON photos(album_id);
CREATE INDEX IF NOT EXISTS idx_albums_slug ON albums(slug);

-- 4. Disable RLS (personal use, all access via server-side API)
ALTER TABLE albums DISABLE ROW LEVEL SECURITY;
ALTER TABLE photos DISABLE ROW LEVEL SECURITY;