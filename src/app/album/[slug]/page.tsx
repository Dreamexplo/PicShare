"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Download, ChevronLeft, ChevronRight, Lock, Image as ImageIcon } from "lucide-react";
import QRCode from "qrcode";

interface Album {
  id: string;
  slug: string;
  title: string;
  description: string;
  layout_type: "masonry" | "grid" | "book";
  password: string | null;
  created_at: string;
}

interface Photo {
  id: string;
  filename: string;
  original_name: string;
  thumbnail_name: string | null;
  width: number;
  height: number;
}

export default function AlbumViewPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [album, setAlbum] = useState<Album | null>(null);
  const [localIp, setLocalIp] = useState("");
  useEffect(() => { fetch("/api/host").then(r => r.json()).then(d => setLocalIp(d.ip)).catch(() => {}); }, []);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [locked, setLocked] = useState(false);

  // Lightbox
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // QR code
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadAlbum(); }, [slug]);

  async function loadAlbum() {
    try {
      const res = await fetch(`/api/albums/by-slug/${slug}`);
      if (!res.ok) { setError("相册不存在或已删除"); return; }
      const data = await res.json();
      setAlbum(data);

      // Check if password protected
      if (data.password) {
        setLocked(true);
        setLoading(false);
        return;
      }

      await loadPhotos(data.id);
    } catch (e) {
      setError("加载失败");
    }
    finally { setLoading(false); }
  }

  async function loadPhotos(albumId: string) {
    const res = await fetch(`/api/albums/${albumId}/photos`);
    const data = await res.json();
    setPhotos(Array.isArray(data) ? data : []);
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!album) return;
    try {
      const res = await fetch(`/api/albums/by-slug/${slug}`);
      const data = await res.json();
      if (data.password === password) {
        setLocked(false);
        await loadPhotos(data.id);
      } else {
        setError("密码错误");
      }
    } catch { setError("验证失败"); }
  }

  useEffect(() => {
    if (qrRef.current && album && typeof window !== "undefined") {
      const url = localIp ? `http://${localIp}:${window.location.port}/album/${album.slug}` : window.location.href;
      QRCode.toCanvas(qrRef.current, url, { width: 140, margin: 1 }, (err) => {
        if (err) console.error(err);
      });
    }
  }, [album, locked]);

  async function handleDownload(photo: Photo) {
    const a = document.createElement("a");
    a.href = `/api/images/${album!.id}/${photo.filename}`;
    a.download = photo.original_name;
    a.click();
  }

  async function handleDownloadAll() {
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      for (const photo of photos) {
        const res = await fetch(`/api/images/${album!.id}/${photo.filename}`);
        const blob = await res.blob();
        zip.file(photo.original_name, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url; a.download = `${album!.slug}.zip`;
      a.click(); URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
  }

  // Password screen
  if (locked && album) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card max-w-sm w-full mx-4 text-center">
          <Lock className="w-10 h-10 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-1">{album.title}</h2>
          <p className="text-sm text-gray-500 mb-6">此相册需密码访问</p>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              className="input text-center"
              type="password"
              placeholder="输入访问密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" className="btn btn-primary w-full">验证</button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">加载中...</div>;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">{error}</p>
      </div>
    </div>
  );
  if (!album) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{album.title}</h1>
            {album.description && <p className="text-sm text-gray-500 mt-0.5">{album.description}</p>}
          </div>
          <div className="flex items-center gap-3">
            <div ref={qrRef} className="hidden sm:block" />
            {photos.length > 0 && (
              <button onClick={handleDownloadAll} className="btn btn-primary text-sm">
                <Download className="w-4 h-4" /> 全部下载
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Photo Count */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-sm text-gray-400">
        {photos.length} 张照片
      </div>

      {/* Photos */}
      {photos.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <ImageIcon className="w-16 h-16 mx-auto mb-4" />
          <p>这个相册还没有照片</p>
        </div>
      ) : album.layout_type === "masonry" ? (
        /* Masonry Layout */
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
          <div className="masonry-grid">
            {photos.map((photo, i) => (
              <div key={photo.id} className="masonry-grid-item group" onClick={() => setLightboxIdx(i)}>
                <img
                  src={`/api/images/${album.id}/thumb/${photo.thumbnail_name || photo.filename}`}
                  alt={photo.original_name}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-2">
                  <button onClick={(e) => { e.stopPropagation(); handleDownload(photo); }}
                    className="text-white bg-black/40 p-1.5 rounded-full hover:bg-black/60">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : album.layout_type === "grid" ? (
        /* Grid Layout */
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
          <div className="photo-wall">
            {photos.map((photo, i) => (
              <div key={photo.id} className="photo-wall-item group" onClick={() => setLightboxIdx(i)}>
                <img
                  src={`/api/images/${album.id}/thumb/${photo.thumbnail_name || photo.filename}`}
                  alt={photo.original_name}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-2">
                  <button onClick={(e) => { e.stopPropagation(); handleDownload(photo); }}
                    className="text-white bg-black/40 p-1.5 rounded-full hover:bg-black/60">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Book Layout */
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
          <div className="book-container">
            {photos.map((photo, i) => (
              <div key={photo.id} className="book-page flex-shrink-0" onClick={() => setLightboxIdx(i)}>
                <img
                  src={`/api/images/${album.id}/${photo.filename}`}
                  alt={photo.original_name}
                  loading="lazy"
                  className="w-full h-full object-contain cursor-pointer"
                />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/40 px-3 py-1 rounded-full">
                  {i + 1} / {photos.length}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div className="lightbox-overlay" onClick={() => setLightboxIdx(null)}>
          <img
            src={`/api/images/${album.id}/${photos[lightboxIdx].filename}`}
            alt={photos[lightboxIdx].original_name}
            onClick={(e) => e.stopPropagation()}
          />
          {lightboxIdx > 0 && (
            <button className="lightbox-nav prev" onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); }}>
              <ChevronLeft />
            </button>
          )}
          {lightboxIdx < photos.length - 1 && (
            <button className="lightbox-nav next" onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); }}>
              <ChevronRight />
            </button>
          )}
          <button
            className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/20 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/30"
            onClick={(e) => { e.stopPropagation(); handleDownload(photos[lightboxIdx]); }}
          >
            <Download className="w-4 h-4" /> 下载
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        由 PicShare 生成 · {album.created_at?.slice(0, 10)}
      </footer>
    </div>
  );
}
