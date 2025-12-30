'use client';
import Link from 'next/link';
import { Fredericka_the_Great } from 'next/font/google';

const fredericka = Fredericka_the_Great({ 
  weight: '400', 
  subsets: ['latin'], 
  display: 'swap', 
  adjustFontFallback: false 
});

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-white">
      <div className="max-w-2xl w-full text-center">
        {/* 404 エラー表示 */}
        <div className="mb-6">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold text-gray-300">
            404
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 mt-2">
            Page Not Found
          </p>
        </div>

        {/* プレーリードッグ画像 */}
        <div className="my-8 flex items-center justify-center">
          <img 
            src="/images/404.png" 
            alt="プレーリードッグのイラスト" 
            className="w-50 h-50 sm:w-30 sm:h-30 md:w-50 md:h-50 object-contain"
          />
        </div>

        {/* 説明文 */}
        <div className="mb-8">
          <p className="text-gray-600 text-lg md:text-[15px] font-bold">
            残念ながら、お探しのKezuLetterは見つかりませんでした。
          </p>
        </div>

        {/* ボタン */}
        <div className="mt-10">
          <Link href="/">
            <button className="bg-[#606060] w-64 md:w-80 h-12  text-white px-8 py-2 rounded-3xl font-bold hover:opacity-90 transition cursor-pointer">
              新しいお手紙を届けに行く
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
