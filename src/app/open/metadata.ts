import type { Metadata } from "next";

const ogpMap = {
  standard: "/images/ogp.png",
  newYear: "/images/ogp.newYear.png",
  anniversary: "/images/ogp.anniversary.png",
} as const;

type SkinParam = keyof typeof ogpMap;

type Props = {
  searchParams: {
    skin?: string;
  };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const rawSkin = searchParams?.skin;
  const skin: SkinParam = rawSkin === "newYear" || rawSkin === "anniversary" ? rawSkin : "standard";

  const title = "KezuLetter";
  const description = "プレーリードッグが届ける秘密のスクラッチレター";
  const image = ogpMap[skin];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
      siteName: "KezuLetter",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
