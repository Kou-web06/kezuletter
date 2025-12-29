'use client';
import { useState } from 'react';
import { Fredericka_the_Great } from 'next/font/google';
import { SKINS, SkinKey } from '@/lib/skins';
import { useCrypto } from '@/hooks/useCrypto';

const fredericka = Fredericka_the_Great({ weight: '400', subsets: ['latin'], display: 'swap', adjustFontFallback: false });

export default function CreatePage() {
  const [text, setText] = useState('');
  const [senderName, setSenderName] = useState('');
  const [anniversaryDate, setAnniversaryDate] = useState('');
  const [url, setUrl] = useState('');
  const [scratchReveal, setScratchReveal] = useState(40);
  const [selectedSkin, setSelectedSkin] = useState<SkinKey>('standard');
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { encrypt } = useCrypto();

  const generateUrl = () => {
    setIsLoading(true);
    setUrl('');
    
    setTimeout(() => {
      const payload = JSON.stringify({
        message: text,
        sender: senderName,
        skin: selectedSkin,
        anniversaryDate: selectedSkin === 'anniversary' ? anniversaryDate : undefined,
      });
      const encrypted = encrypt(payload);
      const fullUrl = `${window.location.origin}/open#${encrypted}`;
      setUrl(fullUrl);
      setIsLoading(false);
    }, 8500);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updatePosition(e.clientX, e.currentTarget.parentElement!);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updatePosition(e.clientX, e.currentTarget);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updatePosition(e.touches[0].clientX, e.currentTarget.parentElement!);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updatePosition(e.touches[0].clientX, e.currentTarget);
  };

  const updatePosition = (clientX: number, container: HTMLElement) => {
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setScratchReveal(percentage);
  };

  const handleSelectSkin = (key: SkinKey) => {
    setSelectedSkin(key);
    // スイッチ切替時に「削る前の状態」をリセット
    setScratchReveal(0);
  };

  const handleCopy = async () => {
    if (!url) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL', error);
    }
  };

  const currentFontFamily = selectedSkin === 'anniversary' ? fredericka.style.fontFamily : SKINS[selectedSkin].font;

  return (
    <div
      className="flex flex-col items-center p-8 gap-4 min-h-screen"
      style={{
        backgroundColor: '#F8FAFC',
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgba(210, 214, 219, 0.25) 2px, transparent 0)',
        backgroundSize: '20px 20px',
      }}
    >
      <div
        className="max-w-124 min-w-90 h-10 mb-4 rounded-xl flex items-center justify-center"
        style={{
          background: 'linear-gradient(90deg, #D9FBFF 0%, #FFC8F4 100%) padding-box, linear-gradient(90deg, rgba(217, 251, 255, 0.6), rgba(255, 200, 244, 0.6)) border-box',
          border: '5px solid transparent',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      >
        <img src="/icons/logo.png" alt="KezuLetter Logo" className="max-w-[124px]" />
      </div>
      {/* 完成イメージプレビュー */}
      <div className="w-full max-w-[350px]">
        <p className="text-xs text-purple-200 font-bold mb-2">カードの完成イメージ</p>
        <div 
          className="relative w-full aspect-[3/2] rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.1)] bg-white cursor-ew-resize mb-8"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          {/* 背面: 完成メッセージ */}
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center p-6 text-slate-800"
            style={{
              backgroundImage: `url(${SKINS[selectedSkin].revealedImg})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <p className="text-[13px] font-bold text-center break-words w-full p-4 text-shadow-[0_2px_4px_rgba(255,255,255,0.8)]"
              style={{
                fontFamily: currentFontFamily,
                color: SKINS[selectedSkin].textColor,
              }}
            >
              {text ? text : 'ここにメッセージが表示されます'}
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
            {senderName && (
              <p
                className="text-[10px] font-bold text-center break-words w-full p-4 text-shadow-[0_2px_4px_rgba(255,255,255,0.8)]"
                style={{
                  fontFamily: currentFontFamily,
                  color: SKINS[selectedSkin].textColor,
                }}
              >
                by {senderName}
              </p>
            )}
          </div>

          {/* 前面: スクラッチ層（スライダーで可動） */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              clipPath: `inset(0 0 0 ${scratchReveal}%)`,
            }}
          >
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: `url(${SKINS[selectedSkin].scratchImg})`,
                backgroundRepeat: 'repeat',
                backgroundSize: 'contain',
              }}
            />
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
          </div>

          {/* 境界線（ドラッグ可能） */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 cursor-ew-resize pointer-events-auto"
            style={{ left: `${scratchReveal}%`, transform: 'translateX(-50%)' }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center">
              <div className="text-white text-xs">
                <img src="/icons/finger.png" className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-6 p-2 rounded-4xl"
        style={{
          background: 'linear-gradient(45deg, rgba(217, 251, 255, 0.3), rgba(255, 200, 244, 0.3) 100%)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      >
      <div className="relative">
        <textarea 
          className="bg-white p-8 rounded-3xl w-83 h-40 min-h-32 text-[12px] text-black shadow-[0_20px_50px_rgba(0,0,0,0.05)] resize-none focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder-gray-400"
          placeholder="隠したいメッセージを入力..."
          onChange={(e) => setText(e.target.value)}
          maxLength={80}
        />
        <p className={`absolute bottom-4 right-4 text-[8px] font-semibold ${text.length > 80 ? 'text-red-400' : 'text-gray-400'}`}>
          {text.length} /80文字
        </p>
      </div>
      <p className="text-center font-bold text-[#606060] text-[12px] mb-2">デザインを選ぶ</p>
        <div className="flex flex-row items-center justify-around w-83 h-15">
          <div className="flex flex-col mb-2">
            <div 
              className={`rounded-3xl w-12 h-12 bg-[#EDEDED] border-3 border-solid cursor-pointer hover:opacity-60 transition flex items-center justify-center mb-2 ${
                selectedSkin === 'standard' ? 'border-[#7CD3E2] scale-110' : 'border-[#F7F7F7]'
              }`}
              onClick={() => handleSelectSkin('standard')}
              style={{
                background: selectedSkin === 'standard'
                  ? 'linear-gradient(135deg, rgba(124, 211, 226, 0.5), rgba(182, 109, 255, 0.5) 100%)'
                  : '#EDEDED',
              }}
            >
              <img src="/icons/envelope.png" alt="envelope icon" className="inline w-6 h-6" />  
            </div>
            <p className="text-center font-bold text-[10px] text-[#606060]">シンプル</p>
          </div> 
          <div className="flex flex-col mb-2 relative">
            <div 
              className={`rounded-3xl w-12 h-12 bg-[#EDEDED] border-3 border-solid cursor-pointer hover:opacity-60 transition flex items-center justify-center mb-2 relative ${
                selectedSkin === 'newYear' ? 'border-[#7CD3E2] scale-110' : 'border-[#F7F7F7]'
              }`}
              onClick={() => handleSelectSkin('newYear')}
              style={{
                background: selectedSkin === 'newYear'
                  ? 'linear-gradient(135deg, rgba(124, 211, 226, 0.5), rgba(182, 109, 255, 0.5) 100%)'
                  : '#EDEDED',
              }}
            >
              <img src="/icons/newYear.png" alt="newYear icon" className="inline w-6 h-6" />  
              <p className="absolute -top-4 left-1/2 -translate-x-1/2 text-[#7CD3E2] text-[10px] font-bold">New</p>
            </div>
            <p className="text-center font-bold text-[10px] text-[#606060]">新年</p>
          </div> 
          <div className="flex flex-col mb-2">
            <div 
              className={`rounded-3xl w-12 h-12 bg-[#EDEDED] border-3 border-solid cursor-pointer hover:opacity-60 transition flex items-center justify-center mb-2 ${
                selectedSkin === 'anniversary' ? 'border-[#7CD3E2] scale-110' : 'border-[#F7F7F7]'
              }`}
              onClick={() => handleSelectSkin('anniversary')}
              style={{
                background: selectedSkin === 'anniversary'
                  ? 'linear-gradient(135deg, rgba(124, 211, 226, 0.5), rgba(182, 109, 255, 0.5) 100%)'
                  : '#EDEDED',
              }}
            >
              <img src="/icons/party.png" alt="party icon" className="inline w-6 h-6" />  
            </div>
            <p className="text-center font-bold text-[10px] text-[#606060]">記念日</p>
          </div>
          <div className="flex flex-col mb-2">
            <div className="rounded-3xl w-12 h-12 border-3 border-solid border-[#F7F7F7] cursor-pointer hover:opacity-60 transition flex items-center justify-center mb-2"
              style={{
                background: 'linear-gradient(45deg, rgba(217, 251, 255, 0.7), rgba(255, 200, 244, 0.7) 100%)',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
              }}
            ></div>
            <p className="text-center font-bold text-[8px] text-[#606060]">Coming Soon...</p>
          </div>  
        </div>
        {selectedSkin === 'anniversary' && (
          <div className="relative w-83 -mt-2">
            <label className="max-w-83 text-[8px] font-bold text-[#606060] mb-1 ml-3 inline-block">
              記念日はいつ？
            </label>
            <input
              type="date"
              className="bg-white p-4 rounded-3xl text-xs w-full h-12 text-black shadow-[0_20px_50px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-purple-300"
              value={anniversaryDate}
              onChange={(e) => setAnniversaryDate(e.target.value)}
            />
          </div>
        )}
        <div className="relative w-83">
          <input 
            type="text"
            className="bg-white p-4 rounded-3xl text-xs w-full h-12 text-black shadow-[0_20px_50px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder-gray-400"
            placeholder="送り主の名前（任意）"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            maxLength={20}
          />
        </div>
        <button 
          onClick={generateUrl}
          className="bg-[#606060] w-83 h-12 text-white px-8 py-2 rounded-3xl font-bold hover:opacity-90 transition cursor-pointer"
        >
          レターURLを発行する
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-col mt-3 p-4 bg-[#FAFCF9] rounded-3xl w-85 max-w-md border-4 border-solid border-[#F3F3F3] flex items-center justify-center">
          <video 
            src="/images/loadingAnimation.mp4" 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-15 h-15 object-contain"
          />
          <p className="mt-3 mb-1 text-[#606060] font-bold text-center text-xs">レターURLを生成中...</p>
        </div>
      )}

      {url && !isLoading && (
        <div className="mt-3 p-4 bg-[#fff] rounded-3xl w-85 max-w-md border-4 border-solid border-[#F3F3F3] flex flex-col gap-3">
          <div className="flex flex-row items-center justify-around gap-2">
            <p className="text-[15px] text-[#606060] text-center font-bold">このURLを友達に送ろう！</p>
            <div className="flex items-center gap-3">
              {copied ? ( 
                <span className="flex justify-center items-center h-10 text-xs text-green-600 font-semibold">Copied !</span>
                ) : (
                  <button
                    onClick={handleCopy}
                    className="rounded-3xl w-10 h-10 bg-[#EDEDED] border-4 border-solid border-[#F8F8F8] cursor-pointer hover:opacity-60 transition flex items-center justify-center"
                  >
                    <img src="/icons/clipboard.png" alt="コピー" className="w-5 h-5" />
                  </button>
                ) 
              }
            </div> 
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-gradient-kezu text-[12px] font-bold break-all ml-2 mr-2 mb-2">{url}</p> 
          </div>
        </div>
      )}
    </div>
  );
}
