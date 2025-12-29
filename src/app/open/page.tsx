import type { Metadata } from "next";
import { headers } from "next/headers";
import OpenClient from "./OpenClient";

const OGP_IMAGES = {
  standard: "/images/ogp.png",
  newYear: "/images/ogp.newYear.png",
  anniversary: "/images/ogp.anniversary.png",
} as const;

type SkinParam = keyof typeof OGP_IMAGES;

type PageProps = {
  searchParams?: {
    s?: SkinParam;
  };
};

const getBaseUrl = () => {
  const hdrs = headers();
  const host = hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://kezuletter.vercel.app";
};

export function generateMetadata({ searchParams }: PageProps): Metadata {
  const skin = (searchParams?.s ?? "standard") as SkinParam;
  const imagePath = OGP_IMAGES[skin] ?? OGP_IMAGES.standard;
  const baseUrl = getBaseUrl();
  const imageUrl = `${baseUrl}${imagePath}`;

  const title = "KezuLetter";
  const description = "プレーリードッグが届ける秘密のスクラッチレター";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [imageUrl],
      siteName: title,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default function OpenPage() {
  return <OpenClient />;
}
