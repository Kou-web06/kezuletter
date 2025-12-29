import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "KezuLetter",
  description: "プレーリードッグが届ける秘密のスクラッチレター",
  openGraph: {
    title: "KezuLetter",
    description: "プレーリードッグが届ける秘密のスクラッチレター",
    images: ["/images/ogp.png"],
    siteName: "KezuLetter",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KezuLetter",
    description: "プレーリードッグが届ける秘密のスクラッチレター",
    images: ["/images/ogp.png"],
  },
};

export default function OpenLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
