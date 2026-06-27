"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, ExternalLink, Trash2, Layout as LayoutIcon, Image } from "lucide-react";

interface Album {
  id: string;
  slug: string;
  title: string;
  description: string;
  layout_type: string;
  password: string | null;
  created_at: string;
}

export default function DashboardPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    if (localStorage.getItem("admin_authenticated") !== "true") {
      window.location.href = "/dashboard/login";
    }
  }, []);
useEffect(() => { fetchAlbums(); }, []);

  async function fetchAlbums() {
    try {
      const res = await fetch("/api/albums");
      const data = await res.json();
      setAlbums(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function deleteAlbum(id: string) {
    if (!confirm("确定删除此相册？所有照片也将被删除。")) return;
    try {
      await fetch(`/api/albums/${id}`, { method: "DELETE" });
      fetchAlbums();
    } catch (e) { console.error(e); }
  }

  const layoutLabels: Record<string, string> = { masonry: "瀑布流", grid: "照片墙", book: "画册" };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <LayoutIcon className="w-6 h-6 text-indigo-500" />
          <span className="font-bold text-lg">PicShare</span>
        </Link>
        <nav className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium">
            <Image className="w-4 h-4" />
            我的相册
          </div>
        </nav>
      </aside>

      <main className="dashboard-main">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">我的相册</h1>
          <Link href="/dashboard/create" className="btn btn-primary">
            <Plus className="w-4 h-4" /> 创建相册
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">加载中...</div>
        ) : albums.length === 0 ? (
          <div className="text-center py-20">
            <Image className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 mb-4">还没有创建任何相册</p>
            <Link href="/dashboard/create" className="btn btn-primary">
              <Plus className="w-4 h-4" /> 创建第一个相册
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => (
              <div key={album.id} className="card hover:shadow-md transition-shadow fade-in">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg truncate">{album.title}</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {layoutLabels[album.layout_type] || album.layout_type}
                  </span>
                </div>
                {album.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{album.description}</p>
                )}
                <p className="text-xs text-gray-400 mb-4">
                  创建于 {album.created_at?.slice(0, 10)}
                  {album.password && " · 密码保护"}
                </p>
                <div className="flex gap-2">
                  <Link href={`/dashboard/albums/${album.id}`} className="btn btn-secondary text-xs flex-1 justify-center">
                    管理
                  </Link>
                  <a href={`/album/${album.slug}`} target="_blank" className="btn btn-secondary text-xs" title="查看">
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button onClick={() => deleteAlbum(album.id)} className="btn btn-danger text-xs" title="删除">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
