import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PicShare - 轻量级电子相册",
  description: "免费、轻量的电子相册分享工具。上传照片，生成链接，随时分享。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
