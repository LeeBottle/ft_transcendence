import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

interface Stroke {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color: string;
  width: number;
}

const socket = io({ autoConnect: false });
const COLORS = ['#000000', '#808080', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'];

export default function Win98Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const previous = useRef({ x: 0, y: 0 });
  const [color, setColor] = useState('#000000');
  const [width, setWidth] = useState(4);

  const draw = (stroke: Stroke) => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    context.strokeStyle = stroke.color;
    context.lineWidth = stroke.width;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(stroke.x0, stroke.y0);
    context.lineTo(stroke.x1, stroke.y1);
    context.stroke();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    const initialize = (strokes: Stroke[]) => {
      clear();
      strokes.forEach(draw);
    };
    socket.on('drawing:init', initialize);
    socket.on('drawing:stroke', draw);
    socket.on('drawing:clear', clear);
    socket.connect();
    return () => {
      socket.off('drawing:init', initialize);
      socket.off('drawing:stroke', draw);
      socket.off('drawing:clear', clear);
      socket.disconnect();
    };
  }, []);

  const position = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * canvas.width / rect.width,
      y: (event.clientY - rect.top) * canvas.height / rect.height,
    };
  };

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    previous.current = position(event);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const next = position(event);
    const stroke = { x0: previous.current.x, y0: previous.current.y, x1: next.x, y1: next.y, color, width };
    draw(stroke);
    socket.emit('drawing:stroke', stroke);
    previous.current = next;
  };

  return (
    <section className="mx-auto max-w-5xl bg-[#c0c0c0] p-1 text-black shadow-[2px_2px_0_#000,-2px_-2px_0_#fff]">
      <div className="flex items-center justify-between bg-[#000080] px-2 py-1 text-sm font-bold text-white">
        <span>🎨 모두의 그림판 - paint.exe</span>
        <div className="flex gap-1">
          {['_', '□', '×'].map((symbol) => <span key={symbol} className="bg-[#c0c0c0] px-1.5 text-black shadow-[inset_1px_1px_0_#fff,inset_-1px_-1px_0_#000]">{symbol}</span>)}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b-2 border-[#808080] p-2 text-xs">
        <span className="font-bold">색상:</span>
        {COLORS.map((item) => (
          <button
            key={item}
            type="button"
            aria-label={`색상 ${item}`}
            onClick={() => setColor(item)}
            className={`h-6 w-6 border-2 ${color === item ? 'border-black' : 'border-white'}`}
            style={{ backgroundColor: item }}
          />
        ))}
        <button type="button" onClick={() => setColor('#ffffff')} className="border-2 border-white bg-[#c0c0c0] px-2 py-1 shadow-[inset_-1px_-1px_0_#000]">지우개</button>
        <label>굵기 <input type="range" min="1" max="20" value={width} onChange={(e) => setWidth(Number(e.target.value))} /></label>
        <button type="button" onClick={() => socket.emit('drawing:clear')} className="ml-auto border-2 border-white bg-[#c0c0c0] px-3 py-1 shadow-[inset_-1px_-1px_0_#000] active:shadow-[inset_1px_1px_0_#000]">전체 지우기</button>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={450}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={() => { drawing.current = false; }}
        onPointerCancel={() => { drawing.current = false; }}
        className="block aspect-video w-full touch-none cursor-crosshair bg-white"
      />
      <div className="border-t-2 border-white px-2 py-1 text-xs">WebSocket 연결 · 다른 사용자와 실시간으로 그려보세요.</div>
    </section>
  );
}
