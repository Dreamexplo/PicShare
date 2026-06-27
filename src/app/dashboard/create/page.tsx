"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Layout, Shield } from "lucide-react";

const LAYOUTS = [
  { id: "masonry", name: "瀑布流", desc: "错落排列，适合多尺寸照片混合展示" },
  { id: "grid", name: "照片墙", desc: "整齐网格，统一裁切，美观大方" },
  { id: "book", name: "画册", desc: "翻页效果，像翻阅一本真正的画册" },
];

export default function CreateAlbumPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [layoutType, setLayoutType] = useState("masonry");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("请输入相册标题"); return; }
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description,
          layout_type: layoutType,
          password: password || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "创建失败");
      }

      const album = await res.json();
      router.push(`/dashboard/albums/${album.id}`);
    } catch (e: any) {
      setError(e.message || "创建失败，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <Layout className="w-6 h-6 text-indigo-500" />
          <span className="font-bold text-lg">PicShare</span>
        </Link>
        <nav className="space-y-2">
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            <Layout className="w-4 h-4" />
            返回相册列表
          </Link>
        </nav>
      </aside>

      <main className="dashboard-main max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">创建新相册</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">相册标题 *</label>
            <input
              className="input"
              placeholder="例如：2026 夏季旅行"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">相册描述（可选）</label>
            <textarea
              className="input min-h-[80px] resize-y"
              placeholder="给相册加一段描述..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">选择版式</label>
            <div className="grid sm:grid-cols-3 gap-3">
              {LAYOUTS.map((layout) => (
                <button
                  key={layout.id}
                  type="button"
                  onClick={() => setLayoutType(layout.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    layoutType === layout.id
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium text-sm mb-1">{layout.name}</div>
                  <div className="text-xs text-gray-500">{layout.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" /> 访问密码（可选）
              </div>
            </label>
            <input
              className="input max-w-xs"
              type="text"
              placeholder="留空则无需密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={20}
            />
            <p className="text-xs text-gray-400 mt-1">设置密码后，访客需要输入密码才能查看相册</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "创建中..." : "创建相册"}
            </button>
            <Link href="/dashboard" className="btn btn-secondary">取消</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
