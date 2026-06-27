"use client";
import Link from "next/link";
import { Camera, Share2, QrCode, Download, Layout } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Camera className="w-7 h-7 text-indigo-500" />
            <span className="text-xl font-bold text-gray-900">PicShare</span>
          </div>
          <Link href="/dashboard" className="btn btn-primary text-sm">
            开始使用
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
          轻量级电子相册，<br className="sm:hidden" />
          <span className="text-indigo-500">即传即享</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
          摄影师上传照片，自动生成精美相册。通过链接或二维码分享给他人，
          支持多种版式浏览与一键下载。
        </p>
        <Link href="/dashboard" className="btn btn-primary text-lg px-8 py-4">
          创建我的相册
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Layout, title: "三种版式", desc: "瀑布流、照片墙、画册翻页，适配不同展示需求" },
            { icon: Share2, title: "即传即享", desc: "创建相册后自动生成链接和二维码，扫码即看" },
            { icon: Download, title: "自由下载", desc: "支持单张下载或一键打包，访客无需登录" },
          ].map((f, i) => (
            <div key={i} className="card text-center hover:shadow-md transition-shadow">
              <f.icon className="w-10 h-10 text-indigo-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-12">三步分享相册</h2>
          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            {[
              { step: 1, title: "创建相册", desc: "起个标题、选择版式" },
              { step: 2, title: "上传照片", desc: "拖拽或选择图片，批量上传" },
              { step: 3, title: "分享链接", desc: "复制链接或分享二维码" },
            ].map((s) => (
              <div key={s.step} className="text-center flex-1">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold mb-1">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-400">
        PicShare - 轻量级电子相册分享工具
      </footer>
    </div>
  );
}
