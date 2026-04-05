import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "泊库云街 - 城市停车空间方案提供商",
  description: "厦门泊库智能科技有限公司 - 专注二层立体车库，服务医院、老旧小区、城投公司",
  openGraph: {
    title: "泊库云街 - 城市停车空间方案提供商",
    description: "专注二层立体车库，服务医院、老旧小区、城投公司。免费获取停车解决方案！",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
