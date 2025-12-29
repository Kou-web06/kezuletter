'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Fredericka_the_Great } from 'next/font/google';
import dynamic from 'next/dynamic';
import { useCrypto } from '@/hooks/useCrypto';
import { ScratchCanvas } from '@/components/canvas/ScratchCanvas';
import { useWindowSize } from 'react-use';
import { useAudio } from '@/hooks/useAudio';
import { SKINS, SkinKey } from '@/lib/skins';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

const fredericka = Fredericka_the_Great({ weight: '400', subsets: ['latin'], display: 'swap' });

export default function OpenPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [sender, setSender] = useState<string | null>(null);
  const [anniversaryDate, setAnniversaryDate] = useState<string | null>(null);
  const [selectedSkin, setSelectedSkin] = useState<SkinKey>('standard');
  const [isRevealed, setIsRevealed] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareImage, setShareImage] = useState<string | null>(null);
  const [shareGenerating, setShareGenerating] = useState(false);
  const { decrypt } = useCrypto();
  const { width, height } = useWindowSize();
  const { playSuccess, playTsurukame, tryPlayTsurukame, restartTsurukame, setTsurukameMuted } = useAudio();
  const [needsSoundUnlock, setNeedsSoundUnlock] = useState(false);
  const [autoPlayed, setAutoPlayed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [reactionKey, setReactionKey] = useState(0);
  const [fallingReactions, setFallingReactions] = useState<Array<{ id: number; reaction: string; left: number; delay: number }>>([]);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleReactionClick = useCallback((reaction: string) => {
    setSelectedReaction(reaction);
    setReactionKey(prev => prev + 1);
    
    const newReactions = Array.from({ length: 50 }, (_, i) => ({
      id: Date.now() + i,
      reaction,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
    }));
    
    setFallingReactions(prev => [...prev, ...newReactions]);
    
    setTimeout(() => {
      setFallingReactions(prev => prev.filter(r => !newReactions.some(nr => nr.id === r.id)));
    }, 2000);
  }, []);

  useEffect(() => {
    // URLのハッシュ (#以降) を取得
    const hash = window.location.hash.substring(1);
    if (hash) {
      const decryptedText = decrypt(hash);
      try {
        const payload = JSON.parse(decryptedText);
        if (payload && typeof payload === 'object') {
          setMessage(payload.message ?? '');
          setSender(payload.sender?.trim() || '匿名');
          setAnniversaryDate(payload.anniversaryDate ?? null);
          if (payload.skin && ['standard', 'newYear', 'anniversary'].includes(payload.skin)) {
            setSelectedSkin(payload.skin as SkinKey);
          }
          return;
        }
      } catch (e) {
        // 旧形式（プレーンテキスト）の場合はそのまま扱う
      }
      setMessage(decryptedText);
    }
  }, [decrypt]);

  // ページ表示直後に新年スキンなら先頭から自動再生を試みる（ブロックされたら解除ボタンを表示）
  useEffect(() => {
    if (selectedSkin === 'newYear' && !autoPlayed) {
      (async () => {
        const ok = await restartTsurukame();
        setAutoPlayed(true);
        if (!ok) {
          setNeedsSoundUnlock(true);
        } else {
          setTsurukameMuted(false);
          setIsMuted(false);
        }
      })();
    }
  }, [selectedSkin, autoPlayed, restartTsurukame, setTsurukameMuted]);

  const handleComplete = () => {
    setIsRevealed(true);
    // 削り終わりは常に成功音のみ（新年スキンも同様）
    playSuccess();
  };

  const handleShareClick = useCallback(async () => {
    if (!isRevealed || !cardRef.current) {
      return;
    }
    try {
      setShareGenerating(true);
      const { default: html2canvasModule } = await import('html2canvas');
      const canvas = await html2canvasModule(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const dataUrl = canvas.toDataURL('image/png');
      setShareImage(dataUrl);
      setShareModalOpen(true);
    } catch (error) {
      console.error('Failed to capture share image', error);
    } finally {
      setShareGenerating(false);
    }
  }, [isRevealed]);

  const handlePostToX = useCallback(() => {
    let shareText = '';
    const senderName = sender || '匿名';
    
    if (selectedSkin === 'newYear') {
      shareText = `${senderName}さんから新年のスクラッチレターが届きました🎍✨ #KezuLetter`;
    } else if (selectedSkin === 'anniversary') {
      shareText = `${senderName}さんから記念日のスクラッチレターが届きました💐💕 #KezuLetter`;
    } else {
      shareText = `${senderName}さんからスクラッチレターが届きました🎁✨ #KezuLetter`;
    }
    
    const intent = new URL('https://twitter.com/intent/tweet');
    intent.searchParams.set('text', shareText);
    intent.searchParams.set('url', window.location.href);
    window.open(intent.toString(), '_blank', 'noopener,noreferrer');
  }, [sender, selectedSkin]);

  const currentFontFamily = selectedSkin === 'anniversary' ? fredericka.style.fontFamily : SKINS[selectedSkin].font;

  if (!message) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="animate-pulse">メッセージを読み込み中...</p>
      </div>
    );
  }

  return (
    <main
      className="flex flex-col items-center p-8 gap-6 min-h-screen"
      style={{
        backgroundColor: '#F8FAFC',
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgba(210, 214, 219, 0.25) 2px, transparent 0)',
        backgroundSize: '20px 20px',
      }}
    >
      {/* 削りきった時の紙吹雪演出 */}
      {isRevealed && <Confetti width={width} height={height} recycle={false} numberOfPieces={220} />}

      {/* 降ってくるリアクション画像 */}
      <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
        {fallingReactions.map((item) => (
          <div
            key={item.id}
            className="absolute animate-[fall_1.5s_ease-in_forwards]"
            style={{
              left: `${item.left}%`,
              top: '-50px',
              animationDelay: `${item.delay}s`,
            }}
          >
            <img 
              src={`/icons/reaction/${item.reaction}.png`} 
              alt={item.reaction} 
              className="w-8 h-8"
            />
          </div>
        ))}
      </div>

      {/* ロゴ */}
      <div
        className="max-w-124 min-w-90 h-10 rounded-xl flex items-center justify-center"
        style={{
          background:
            'linear-gradient(90deg, #D9FBFF 0%, #FFC8F4 100%) padding-box, linear-gradient(90deg, rgba(217, 251, 255, 0.6), rgba(255, 200, 244, 0.6)) border-box',
          border: '5px solid transparent',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      >
        <img src="/icons/logo.png" alt="KezuLetter Logo" className="max-w-[124px]" />
      </div>
      {/* 新年スキン向け 音声コントロール（解除 or ミュート） */}
      {selectedSkin === 'newYear' && (
        <div className="fixed top-4 right-4 z-20 drop-shadow-sm">
          {needsSoundUnlock ? (
            <button
              onClick={() => {
                restartTsurukame();
                setNeedsSoundUnlock(false);
                setTsurukameMuted(false);
                setIsMuted(false);
              }}
              className="rounded-3xl w-10 h-10 bg-[#EDEDED] border-3 border-solid border-[#F7F7F7] cursor-pointer hover:opacity-60 transition flex items-center justify-center"
            >
              <img src="/icons/speaker.png" alt="音をオンにする" className="w-4 h-4 inline-block" />
            </button>
          ) : (
            <button
              onClick={() => {
                const next = !isMuted;
                setTsurukameMuted(next);
                setIsMuted(next);
              }}
              className="rounded-3xl p-1 w-10 h-10 bg-[#EDEDED] border-3 border-solid border-[#F7F7F7] cursor-pointer hover:opacity-60 transition flex items-center justify-center"
            >
              {isMuted ? (
                <img src="/icons/speaker.png" alt="off" className="w-4 h-4 inline" />
                ) : (
                <img src="/icons/muted.png" alt="on" className="w-4 h-4 inline" />
                )}
            </button>
          )}
        </div>
      )}
      {sender && (
        <p className="mt-3 mb-4 text-[12px] font-bold text-[#606060] italic">
          <span className="text-gradient-kezu">{sender}</span>さんから秘密のレターが届いています
        </p>
      )}
      <p className="text-center font-bold text-[#606060] text-[12px]">指でこすって中身を確認してね</p>

      {/* スクラッチカード */}
      <div
        ref={cardRef}
        className="relative w-full max-w-[350px] aspect-[3/2] rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.1)] bg-white"
      >
        {/* 背面: メッセージ */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-6"
          style={{
            backgroundImage: `url(${SKINS[selectedSkin].revealedImg})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <p
            className="text-[13px] font-bold text-center break-words w-full p-4 text-shadow-[0_2px_4px_rgba(255,255,255,0.8)]"
            style={{
              fontFamily: currentFontFamily,
              color: SKINS[selectedSkin].textColor,
            }}
          >
            {message}
          </p>
          {selectedSkin === 'anniversary' && anniversaryDate && (
            <p
              className="absolute right-1 top-2 rotate-3 text-[11px] font-bold text-center break-words w-full p-2 text-shadow-[0_2px_4px_rgba(255,255,255,0.8)]"
              style={{
                fontFamily: currentFontFamily,
                color: SKINS[selectedSkin].textColor,
              }}
            >
              {anniversaryDate}
            </p>
          )}
          {sender && (
            <p className="text-[10px] font-bold text-center break-words w-full px-2 text-shadow-[0_2px_4px_rgba(255,255,255,0.8)]"
              style={{
              fontFamily: currentFontFamily,
              color: SKINS[selectedSkin].textColor,
              }}
            >
              by {sender}
            </p>
          )}
          {/* リアクション表示エリア */}
          {selectedReaction && (
            <div 
              key={reactionKey}
              className="absolute bottom-2 right-2 z-20 animate-[stamp_0.3s_ease-out]"
            >
              <div className="rounded-full w-10 h-10 bg-white border-2 border-dotted border-[#F3F3F3] flex items-center justify-center shadow-lg">
                <img src={`/icons/reaction/${selectedReaction}.png`} alt={selectedReaction} className="w-5 h-5" />
              </div>
            </div>
          )}
        </div>

        {/* 前面: スクラッチ層 */}
        {!isRevealed && (
          <div className="absolute inset-0 z-10">
            <ScratchCanvas
              width={350}
              height={233}
              onComplete={handleComplete}
              scratchImg={SKINS[selectedSkin].scratchImg}
              particleColor={SKINS[selectedSkin].particleColor}
            />
          </div>
        )}
      </div>

      {/* アクションエリア */}
      {isRevealed ? (
        <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="text-center w-88 h-56 text-[#606060] text-sm font-bold mb-4 rounded-3xl flex flex-col items-center"
            style={{
              background: 'linear-gradient(135deg, rgba(217, 251, 255, 0.5), rgba(255, 200, 244, 0.5) 100%)',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
            }}
          >
            <p className="mt-5 mb-2">今の気持ちは？</p>
            <div className="flex flex-row items-center justify-around w-83 h-15 mb-4">
              <div 
                onClick={() => handleReactionClick('thank')}
                className={`rounded-3xl w-12 h-12 bg-[#EDEDED] border-3 border-solid cursor-pointer hover:opacity-60 transition flex items-center justify-center mb-2 ${
                  selectedReaction === 'thank' ? 'border-[#7CD3E2] scale-110' : 'border-[#F7F7F7]'
                }`}
                style={{
                background: selectedReaction === 'thank' 
                  ? 'linear-gradient(135deg, rgba(124, 211, 226, 0.5), rgba(182, 109, 255, 0.5) 100%)'
                  : 'linear-gradient(135deg, rgb(217, 251, 255), rgb(255, 200, 244) 100%)',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
              }}>
                <img src="/icons/reaction/thank.png" alt="thank icon" className="inline w-6 h-6" />  
              </div>
              <div 
                onClick={() => handleReactionClick('great')}
                className={`rounded-3xl w-12 h-12 bg-[#EDEDED] border-3 border-solid cursor-pointer hover:opacity-60 transition flex items-center justify-center mb-2 ${
                  selectedReaction === 'great' ? 'border-[#7CD3E2] scale-110' : 'border-[#F7F7F7]'
                }`}
                style={{
                background: selectedReaction === 'great'
                  ? 'linear-gradient(135deg, rgba(124, 211, 226, 0.5), rgba(182, 109, 255, 0.5) 100%)'
                  : 'linear-gradient(135deg, rgb(217, 251, 255), rgb(255, 200, 244) 100%)',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
              }}>
                <img src="/icons/reaction/great.png" alt="great icon" className="inline w-6 h-6" />  
              </div>
              <div 
                onClick={() => handleReactionClick('precious')}
                className={`rounded-3xl w-12 h-12 bg-[#EDEDED] border-3 border-solid cursor-pointer hover:opacity-60 transition flex items-center justify-center mb-2 ${
                  selectedReaction === 'precious' ? 'border-[#7CD3E2] scale-110' : 'border-[#F7F7F7]'
                }`}
                style={{
                background: selectedReaction === 'precious'
                  ? 'linear-gradient(135deg, rgba(124, 211, 226, 0.5), rgba(182, 109, 255, 0.5) 100%)'
                  : 'linear-gradient(135deg, rgb(217, 251, 255), rgb(255, 200, 244) 100%)',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
              }}>
                <img src="/icons/reaction/precious.png" alt="precious icon" className="inline w-6 h-6" />  
              </div>
              <div 
                onClick={() => handleReactionClick('laugh')}
                className={`rounded-3xl w-12 h-12 bg-[#EDEDED] border-3 border-solid cursor-pointer hover:opacity-60 transition flex items-center justify-center mb-2 ${
                  selectedReaction === 'laugh' ? 'border-[#7CD3E2] scale-110' : 'border-[#F7F7F7]'
                }`}
                style={{
                background: selectedReaction === 'laugh'
                  ? 'linear-gradient(135deg, rgba(124, 211, 226, 0.5), rgba(182, 109, 255, 0.5) 100%)'
                  : 'linear-gradient(135deg, rgb(217, 251, 255), rgb(255, 200, 244) 100%)',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
              }}>
                <img src="/icons/reaction/laugh.png" alt="laugh icon" className="inline w-6 h-6" />  
              </div>
            </div>

            <button className="bg-[#606060] w-85 h-12 text-white px-8 py-2 rounded-3xl font-bold hover:opacity-90 transition cursor-pointer mb-2">
              <a href="/" className="flex items-center justify-center">
              お返しを贈る
              </a>
            </button>
            <button
              onClick={handleShareClick}
              disabled={shareGenerating || !isRevealed}
              className="bg-white w-85 h-12 mb-2 text-[#606060] px-8 py-2 rounded-3xl font-bold border-4 border-solid border-[#F3F3F3] hover:opacity-80 hover:border-[#D0D0D0] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {shareGenerating ? '画像生成中...' : 'サプライズをシェアする'}
            </button>
          </div>
          <div className="flex flex-col items-center gap-0">
            <img className="w-20 self-end" src="/images/coffee.png" alt="drink coffee"/>
            <a href="https://buymeacoffee.com/kouwebapp" target="_blank" rel="noopener noreferrer" className="w-87 bg-[#606060] hover:bg-[#505050] text-white text-sm py-3 rounded-full font-extrabold border-5 border-solid border-[#E6E6E6] hover:border-[#B0B0B0] transition-all duration-200 cursor-pointer flex items-center justify-center">
              開発者にコーヒーを奢る
            </a>
          </div>
        </div>
      ) : (
        <div className="h-16" /> // スペース確保用
      )}

      {/* シェア用モーダル */}
      {shareModalOpen && shareImage && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl flex flex-col gap-4">
            <h3 className="text-center text-sm font-bold text-[#606060]">画像を長押しして保存してね</h3>
            <div className="rounded-2xl overflow-hidden border border-[#E6E6E6]">
              <img src={shareImage} alt="スクラッチ結果" className="w-full" />
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handlePostToX}
                className="bg-[#606060] text-white w-full h-11 rounded-2xl font-bold hover:opacity-90 cursor-pointer transition"
              >
                Xでポストする
              </button>
              <button
                onClick={() => setShareModalOpen(false)}
                className="w-full h-11 rounded-2xl font-bold border border-[#E6E6E6] text-[#606060] hover:bg-[#F5F5F5] cursor-pointer transition"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}