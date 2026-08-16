import { useEffect } from 'react';

interface TitleUnlockModalProps {
  title: string | null;
  onClose: () => void;
}

export default function TitleUnlockModal({ title, onClose }: TitleUnlockModalProps) {
  useEffect(() => {
    if (title) {
      const timer = setTimeout(() => {
        onClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [title, onClose]);

  if (!title) return null;

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-bounce">
      <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 p-[2px] rounded-2xl shadow-2xl shadow-yellow-500/30">
        <div className="bg-gray-950 px-6 py-4 rounded-2xl flex items-center gap-4">
          <div className="text-3xl animate-spin">🏆</div>
          <div>
            <div className="text-xs text-yellow-400 font-bold uppercase tracking-wider">
              NEW TITLE UNLOCKED!
            </div>
            <div className="text-lg font-extrabold text-white">
              칭호 획득: <span className="text-yellow-300">[{title}]</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-3 text-gray-400 hover:text-white text-sm font-bold p-1"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
