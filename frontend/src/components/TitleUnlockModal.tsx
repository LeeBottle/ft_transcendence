import { useEffect, useRef, useState } from 'react';

interface TitleUnlockModalProps {
  title: string | null;
  onClose: () => void;
}

export default function TitleUnlockModal({ title, onClose }: TitleUnlockModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!title || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsScratched(false);
    canvas.width = canvas.offsetWidth || 280;
    canvas.height = canvas.offsetHeight || 100;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#d1d5db');
    gradient.addColorStop(0.5, '#9ca3af');
    gradient.addColorStop(1, '#6b7280');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🪙 문질러서 칭호 확인!', canvas.width / 2, canvas.height / 2);
  }, [title]);

  if (!title) return null;

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fill();

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparentPixels = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) transparentPixels++;
    }

    const ratio = transparentPixels / (imageData.data.length / 4);
    if (ratio > 0.35 && !isScratched) {
      setIsScratched(true);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) scratch(e.clientX, e.clientY);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (e.touches.length > 0) scratch(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length > 0) scratch(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleModalClick = () => {
    if (isScratched) {
      onClose();
    }
  };

  return (
    <div className="fixed top-20 right-6 z-50">
      <div
        onClick={handleModalClick}
        className={`bg-gray-900/95 border-2 border-amber-500 p-5 rounded-2xl shadow-2xl shadow-yellow-500/20 w-80 relative flex flex-col items-center gap-3 cursor-pointer transition-all ${
          isScratched ? 'hover:scale-105 active:scale-95 border-amber-400 shadow-yellow-500/50' : ''
        }`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-3 right-3 text-gray-400 hover:text-white font-bold text-sm z-20"
        >
          ✕
        </button>

        <div className="text-center">
          <div className="text-[10px] text-yellow-400 font-extrabold tracking-widest uppercase">
            🎁 SECRET TITLE REWARD
          </div>
          <h3 className="text-base font-bold text-white">축하합니다! 칭호 획득</h3>
        </div>

        {/* Scratch Card Container */}
        <div className="relative w-full h-24 rounded-xl overflow-hidden bg-gradient-to-br from-amber-950 via-gray-900 to-amber-950 border border-amber-500/40 flex flex-col items-center justify-center p-3 text-center">
          <div className="flex flex-col items-center justify-center gap-0.5 select-none">
            <span className="text-2xl">🏆</span>
            <span className="text-amber-300 font-extrabold text-base tracking-wide">[{title}]</span>
            <span className="text-[10px] text-gray-300">대표 칭호로 설정되었습니다!</span>
          </div>

          {!isScratched && (
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
              className="absolute inset-0 w-full h-full cursor-pointer z-10 touch-none"
            />
          )}
        </div>

        <p className="text-[11px] text-gray-400 font-medium text-center">
          {isScratched ? '✨ 한 번 더 클릭하면 닫힙니다.' : '👆 은색 영역을 문질러서 칭호를 확인하세요!'}
        </p>
      </div>
    </div>
  );
}
