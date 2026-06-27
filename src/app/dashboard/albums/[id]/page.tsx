"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, QrCode, Download, Trash2, Settings, Image, Check, Copy } from "lucide-react";
import QRCode from "qrcode";

interface Album {
  id: string; slug: string; title: string; description: string;
  layout_type: string; password: string | null; custom_options: string;
}

interface Photo {
  id: string; filename: string; original_name: string;
  thumbnail_name: string | null; width: number; height: number; file_size: number;
}

const LAYOUTS = ["masonry", "grid", "book"];

export default function AlbumManagePage() {
  const params = useParams();
  const router = useRouter();
  const albumId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [localIp, setLocalIp] = useState("");

  useEffect(() => {
    fetch("/api/host").then(r => r.json()).then(d => setLocalIp(d.ip)).catch(() => {});
  }, []);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editLayout, setEditLayout] = useState("masonry");
  const [editPassword, setEditPassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const shareUrl = album ? `${window.location.protocol}//${localIp || window.location.hostname}:${window.location.port}/album/${album.slug}` : "";

  useEffect(() => { loadAlbum(); }, [albumId]);

  useEffect(() => {
    if (showQR && qrCanvasRef.current && shareUrl) {
      QRCode.toCanvas(qrCanvasRef.current, shareUrl, { width: 140, margin: 1 }, (err: any) => {
        if (err) console.error(err);
      });
    }
  }, [showQR, shareUrl]);

  async function loadAlbum() {
    try {
      const [albumRes, photosRes] = await Promise.all([
        fetch(`/api/albums/${albumId}`),
        fetch(`/api/albums/${albumId}/photos`),
      ]);
      if (!albumRes.ok) { router.push("/dashboard"); return; }
      const albumData = await albumRes.json();
      const photosData = await photosRes.json();
      setAlbum(albumData);
      setPhotos(Array.isArray(photosData) ? photosData : []);
      setEditTitle(albumData.title);
      setEditDesc(albumData.description || "");
      setEditLayout(albumData.layout_type);
      setEditPassword(albumData.password || "");
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("photos", f));

    try {
      setUploadProgress(`Uploading ${files.length} images...`);
      const res = await fetch(`/api/upload/${albumId}`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      await loadAlbum();
      setUploadProgress("Upload complete!");
    } catch (e: any) {
      setUploadProgress(`Upload failed: ${e.message}`);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(""), 3000);
    }
  }

  async function handleSaveSettings() {
    try {
      const res = await fetch(`/api/albums/${albumId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, description: editDesc, layout_type: editLayout, password: editPassword || null }),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      setAlbum(data);
      setEditing(false);
    } catch (e) { console.error(e); }
  }

  async function handleDownloadAll() {
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      for (const photo of photos) {
        const res = await fetch(`/api/images/${albumId}/${photo.filename}`);
        const blob = await res.blob();
        zip.file(photo.original_name, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url; a.download = `${album?.slug || "album"}.zip`;
      a.click(); URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  }

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;
  if (!album) return null;

  const layoutLabels: Record<string, string> = { masonry: "Masonry", grid: "Grid", book: "Book" };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <Link href="/dashboard" className="flex items-center gap-2 mb-8">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back</span>
        </Link>
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium">
            <Image className="w-4 h-4" />
            {album.title}
          </div>
          <p className="text-xs text-gray-400 px-3">{photos.length} photos</p>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{album.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {album.description} &middot; {layoutLabels[album.layout_type]} layout
              {album.password && " &middot; password protected"}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditing(!editing)} className="btn btn-secondary text-sm">
              <Settings className="w-4 h-4" /> Settings
            </button>
            <button onClick={() => setShowQR(!showQR)} className="btn btn-secondary text-sm">
              <QrCode className="w-4 h-4" /> Share
            </button>
          </div>
        </div>

        {showQR && (
          <div className="card mb-6 fade-in">
            <label className="block text-sm font-medium mb-2">Share Link</label>
            <div className="flex gap-2 mb-4">
              <input className="input flex-1" value={shareUrl} readOnly onClick={(e) => (e.target as HTMLInputElement).select()} />
              <button onClick={copyShareLink} className="btn btn-secondary">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center gap-4">
              <canvas ref={qrCanvasRef} className="bg-white p-2 rounded-lg border" />
              <div className="text-xs text-gray-400">
                <p>Scan QR code to view album</p>
                <p className="mt-1">No login required for visitors</p>
              </div>
            </div>
          </div>
        )}

        {editing && (
          <div className="card mb-6 fade-in space-y-4">
            <h3 className="font-semibold">Album Settings</h3>
            <div>
              <label className="text-sm">Title</label>
              <input className="input mt-1" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm">Description</label>
              <textarea className="input mt-1" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
            </div>
            <div>
              <label className="text-sm">Layout</label>
              <select className="select mt-1" value={editLayout} onChange={(e) => setEditLayout(e.target.value)}>
                {LAYOUTS.map((l) => <option key={l} value={l}>{layoutLabels[l]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm">Password (leave empty to remove)</label>
              <input className="input mt-1" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Set password" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveSettings} className="btn btn-primary text-sm">Save</button>
              <button onClick={() => setEditing(false)} className="btn btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        )}

        <div className="card mb-6">
          <div
            className="dropzone"
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("active"); }}
            onDragLeave={(e) => e.currentTarget.classList.remove("active")}
            onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("active"); handleUpload(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">Drag images here or click to select</p>
            <p className="text-xs text-gray-400 mt-1">Supports JPG / PNG / WebP</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          {uploadProgress && (
            <div className="mt-3 text-sm text-indigo-600">{uploadProgress}</div>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Photos ({photos.length})</h2>
          {photos.length > 0 && (
            <div className="flex gap-2">
              <button onClick={handleDownloadAll} className="btn btn-secondary text-xs">
                <Download className="w-3 h-3" /> Download All
              </button>
            </div>
          )}
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Image className="w-12 h-12 mx-auto mb-2" />
            <p>No photos yet, upload some!</p>
          </div>
        ) : (
          <div className="photo-grid">
            {photos.map((photo) => (
              <div key={photo.id} className="photo-grid-item group">
                <img
                  src={`/api/images/${albumId}/thumb/${photo.thumbnail_name || photo.filename}`}
                  alt={photo.original_name}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a
                    href={`/api/images/${albumId}/${photo.filename}`}
                    download={photo.original_name}
                    className="text-white bg-white/20 p-2 rounded-full hover:bg-white/30"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
