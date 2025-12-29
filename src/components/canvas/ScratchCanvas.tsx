'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useAudio } from '@/hooks/useAudio';

interface ScratchCanvasProps {
  width: number;
  height: number;
  onComplete: () => void;
  scratchImg?: string;
  particleColor?: string;
}

export const ScratchCanvas = ({ width, height, onComplete, scratchImg = '/textures/silver.png', particleColor = '#c0c0c0' }: ScratchCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const { playScratch, stopScratch, playSuccess } = useAudio();
  const [isCompleted, setIsCompleted] = useState(false);
  const lastPosRef = useRef<{x: number; y: number} | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Array<{ x: number; y: number; vx: number; vy: number; alpha: number; radius: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 指定されたテクスチャ画像を読み込んで塗る
    const img = new Image();
    img.src = scratchImg;
    img.onload = () => {
      // 画像をCanvasサイズに合わせてスケーリング
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = width;
      offscreenCanvas.height = height;
      const offscreenCtx = offscreenCanvas.getContext('2d');
      if (offscreenCtx) {
        offscreenCtx.drawImage(img, 0, 0, width, height);
        const pattern = ctx.createPattern(offscreenCanvas, 'repeat');
        ctx.fillStyle = pattern || '#C0C0C0';
        ctx.fillRect(0, 0, width, height);
      }
    };
    img.onerror = () => {
        // 画像がない場合はグレーで塗りつぶす
          ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(0, 0, width, height);
    }
        }, [width, height, scratchImg]);

  const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Canvasの表示サイズと内部解像度の比率を計算
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;

    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isCompleted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getPosition(e);
    const last = lastPosRef.current;
    lastPosRef.current = { x, y };

    // パーティクル生成（別キャンバス）
    const pCanvas = particleCanvasRef.current;
    const pCtx = pCanvas?.getContext('2d') || null;
    if (pCtx) {
      const count = 32; // 粉の量を増やす
      for (let i = 0; i < count; i++) {
        // 進行方向にやや飛びやすいように初期速度を設定
        const baseVx = last ? (x - last.x) * 0.2 : 0;
        const baseVy = last ? (y - last.y) * 0.2 : 0;
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 2.2;
        const vx = baseVx + Math.cos(angle) * speed;
        const vy = baseVy + Math.sin(angle) * speed - 0.5; // 少し上方向に
        const radius = Math.random() * 2.5 + 0.8;
        const alpha = 0.9;
        particlesRef.current.push({ x, y, vx, vy, alpha, radius });
      }
      startParticlesAnimation();
    }

    // 消しゴム（スクラッチ）
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2); // 削るブラシのサイズ
    ctx.fill();
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (isCompleted) return;
    setIsDrawing(true);
    playScratch();
    const pos = getPosition(e);
    lastPosRef.current = { x: pos.x, y: pos.y };
    draw(e);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    stopScratch();
    checkCompletion();
  };

  const checkCompletion = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparentPixels++;
      }
    }

    const percentage = (transparentPixels / (pixels.length / 4)) * 100;
    if (percentage > 40) { // 40%以上削れたらクリア
      setIsCompleted(true);
      playSuccess();
      onComplete();
      
      // 残りを全部消すアニメーション
      canvas.style.transition = 'opacity 0.5s';
      canvas.style.opacity = '0';
      if (particleCanvasRef.current) {
        particleCanvasRef.current.style.transition = 'opacity 0.5s';
        particleCanvasRef.current.style.opacity = '0';
      }
    }
  };

  const startParticlesAnimation = () => {
    if (rafRef.current !== null) return; // 既に動いている
    const loop = () => {
      const pCanvas = particleCanvasRef.current;
      const pCtx = pCanvas?.getContext('2d') || null;
      if (pCtx && pCanvas) {
        pCtx.clearRect(0, 0, width, height);
        const arr = particlesRef.current;
        // 更新＆描画
        for (let i = arr.length - 1; i >= 0; i--) {
          const p = arr[i];
          // 物理更新
          p.vx *= 0.98;
          p.vy = p.vy * 0.98 + 0.15; // 摩擦＋重力
          p.x += p.vx;
          p.y += p.vy;
          p.alpha *= 0.96;
          // 画面外やフェードアウトで削除
          if (p.alpha < 0.06 || p.x < -5 || p.x > width + 5 || p.y > height + 5) {
            arr.splice(i, 1);
            continue;
          }
          pCtx.beginPath();
          pCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          pCtx.fillStyle = hexWithAlpha(particleColor, p.alpha);
          pCtx.fill();
        }
      }
      if (particlesRef.current.length > 0 || isDrawing) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        rafRef.current = null;
      }
    };
    rafRef.current = requestAnimationFrame(loop);
  };

  const hexWithAlpha = (hex: string, alpha: number) => {
    // #rrggbb を rgba に変換
    const m = hex.replace('#', '');
    const r = parseInt(m.substring(0, 2), 16);
    const g = parseInt(m.substring(2, 4), 16);
    const b = parseInt(m.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="absolute top-0 left-0 w-full h-full cursor-pointer touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <canvas
        ref={particleCanvasRef}
        width={width}
        height={height}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
    </>
  );
};