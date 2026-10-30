import { useState, useEffect } from 'react';

interface PuzzleCaptchaProps {
  onVerify: () => void;
  isVerified: boolean;
}

const GOAL = [1, 2, 3, 4, 5, 6, 7, 8, 0];

// Helper to generate a solvable puzzle with ~4-7 clicks required
const generateSolvablePuzzle = () => {
  let tiles = [...GOAL];
  let emptyIndex = 8;
  let prevIndex = -1;
  const numMoves = 10;

  for (let i = 0; i < numMoves; i++) {
    const validNeighbors: number[] = [];
    const row = Math.floor(emptyIndex / 3);
    const col = emptyIndex % 3;

    if (row > 0 && emptyIndex - 3 !== prevIndex) validNeighbors.push(emptyIndex - 3); // Up
    if (row < 2 && emptyIndex + 3 !== prevIndex) validNeighbors.push(emptyIndex + 3); // Down
    if (col > 0 && emptyIndex - 1 !== prevIndex) validNeighbors.push(emptyIndex - 1); // Left
    if (col < 2 && emptyIndex + 1 !== prevIndex) validNeighbors.push(emptyIndex + 1); // Right

    if (validNeighbors.length === 0) break;

    const nextIndex = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
    tiles[emptyIndex] = tiles[nextIndex];
    tiles[nextIndex] = 0;
    prevIndex = emptyIndex;
    emptyIndex = nextIndex;
  }

  // Ensure it's not accidentally solved already
  if (tiles.every((val, idx) => val === GOAL[idx])) {
    return generateSolvablePuzzle();
  }

  return tiles;
};

export default function PuzzleCaptcha({ onVerify, isVerified }: PuzzleCaptchaProps) {
  const [tiles, setTiles] = useState<number[]>([]);

  useEffect(() => {
    setTiles(generateSolvablePuzzle());
  }, []);

  const handleTileClick = (index: number) => {
    if (isVerified) return;

    const emptyIndex = tiles.indexOf(0);
    const row = Math.floor(index / 3);
    const col = index % 3;
    const emptyRow = Math.floor(emptyIndex / 3);
    const emptyCol = emptyIndex % 3;

    const isAdjacent =
      (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
      (col === emptyCol && Math.abs(row - emptyRow) === 1);

    if (isAdjacent) {
      const newTiles = [...tiles];
      newTiles[emptyIndex] = newTiles[index];
      newTiles[index] = 0;
      setTiles(newTiles);

      if (newTiles.every((val, idx) => val === GOAL[idx])) {
        onVerify();
      }
    }
  };

  const handleReset = () => {
    if (isVerified) return;
    setTiles(generateSolvablePuzzle());
  };

  return (
    <div className="bg-gray-950 p-4 rounded-xl border border-gray-700 flex flex-col items-center gap-3">
      <div className="flex justify-between items-center w-full px-1">
        <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
          {isVerified ? (
            <span className="text-green-400 font-bold">✓ 인간 검증 완료</span>
          ) : (
            <>🧩 퍼즐을 완성하세요 (1~8 순서대로)</>
          )}
        </span>
        {!isVerified && (
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] text-gray-400 hover:text-white underline"
          >
            다시섞기
          </button>
        )}
      </div>

      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 gap-2 w-48 h-48 bg-gray-900 p-2 rounded-lg border border-gray-800">
        {tiles.map((num, idx) => {
          if (num === 0) {
            return (
              <div
                key={idx}
                className="w-full h-full bg-gray-950/50 rounded border border-dashed border-gray-800"
              />
            );
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleTileClick(idx)}
              disabled={isVerified}
              className={`w-full h-full rounded-md font-bold text-lg flex items-center justify-center transition-all transform active:scale-95 shadow ${
                isVerified
                  ? 'bg-green-600 text-white cursor-default'
                  : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
              }`}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
}
