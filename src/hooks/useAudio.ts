import { useRef, useEffect } from 'react';

export const useAudio = () => {
  const scratchAudio = useRef<HTMLAudioElement | null>(null);
  const successAudio = useRef<HTMLAudioElement | null>(null);
  const tsurukameAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      scratchAudio.current = new Audio('/sounds/scratch.mp3');
      scratchAudio.current.loop = true;
      successAudio.current = new Audio('/sounds/success.mp3');
      tsurukameAudio.current = new Audio('/sounds/tsurukame.mp3');
      tsurukameAudio.current.preload = 'auto';
    }
  }, []);

  // 削り音（ループ再生用）
  const playScratch = () => {
    scratchAudio.current?.play().catch(() => {});
  };

  const stopScratch = () => {
    if (scratchAudio.current) {
      scratchAudio.current.pause();
      scratchAudio.current.currentTime = 0;
    }
  };

  // 完了音
  const playSuccess = () => {
    successAudio.current?.play().catch(() => {});
  };

  // 新年用つるかめ音
  const playTsurukame = () => {
    tsurukameAudio.current?.play().catch(() => {});
  };

  // 新年用つるかめ音（成功/失敗を返す）
  const tryPlayTsurukame = async (): Promise<boolean> => {
    try {
      await tsurukameAudio.current?.play();
      return true;
    } catch {
      return false;
    }
  };

  // 新年用つるかめ音を先頭から再生（成功/失敗を返す）
  const restartTsurukame = async (): Promise<boolean> => {
    if (!tsurukameAudio.current) return false;
    tsurukameAudio.current.currentTime = 0;
    try {
      await tsurukameAudio.current.play();
      return true;
    } catch {
      return false;
    }
  };

  // 新年用つるかめ音のミュート切り替え
  const setTsurukameMuted = (muted: boolean) => {
    if (tsurukameAudio.current) {
      tsurukameAudio.current.muted = muted;
    }
  };

  return { playScratch, stopScratch, playSuccess, playTsurukame, tryPlayTsurukame, restartTsurukame, setTsurukameMuted };
};
