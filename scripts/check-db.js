const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing SUPABASE_URL or SUPABASE_KEY - check your .env.local");
  process.exit(1);
}

const { createClient } = require("@supabase/supabase-js");

async function main() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Check albums table
  const { data: albums, error: albumsErr } = await supabase.from("albums").select("*");
  if (albumsErr) { console.log("ERROR checking albums:", albumsErr.message); return; }
  console.log(`Albums table: ${albums.length} records`);
  albums.forEach(a => console.log(`  - ${a.id}: "${a.title}" (slug: ${a.slug})`));

  // Check photos table
  const { data: photos, error: photosErr } = await supabase.from("photos").select("*");
  if (photosErr) { console.log("ERROR checking photos:", photosErr.message); return; }
  console.log(`\nPhotos table: ${photos.length} records`);
  photos.forEach(p => console.log(`  - ${p.id} in album ${p.album_id}: ${p.filename}`));

  // Check storage
  const { data: buckets } = await supabase.storage.listBuckets();
  console.log(`\nStorage buckets: ${buckets ? buckets.length : 0}`);
  buckets?.forEach(b => console.log(`  - ${b.name} (${b.public ? "public" : "private"})`));

  // List files in picshare bucket
  const { data: files } = await supabase.storage.from("picshare").list("originals", { limit: 100 });
  console.log(`\nStorage picshare bucket - originals/:`);
  if (files && files.length > 0) {
    files.forEach(f => console.log(`  - ${f.name}`));
  } else {
    console.log("  (empty)");
  }
}

main().catch(e => console.log("Error:", e.message));