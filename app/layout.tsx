import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "スケジュール調整カレンダー",
  description: "友達と空いている日を共有するカレンダー",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
