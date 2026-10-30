import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CategoryKey, CATEGORY_LABELS, ScoreSheet } from '../Yacht/yachtScore';

interface MatchStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: string;
  maxScore: number;
  avgScore: number;
}

interface MatchRecord {
  matchId: string;
  roomTitle: string;
  gameType: string;
  playedAt: string;
  rank: number;
  myScore: number;
  isWin: boolean;
  winnerNickname: string;
  winnerScore: number;
  myScoresSheet: ScoreSheet;
}

interface MatchDetail {
  id: string;
  roomTitle: string;
  playedAt: string;
  winnerNickname: string;
  winnerScore: number;
  participants: {
    id: string;
    nickname: string;
    isAi: boolean;
    rank: number;
    totalScore: number;
    scoresSheet: ScoreSheet;
  }[];
}

const CATEGORIES: CategoryKey[] = [
  'ones', 'twos', 'threes', 'fours', 'fives', 'sixes',
  'choice', 'fourOfAKind', 'fullHouse', 'smallStraight', 'largeStraight', 'yacht'
];

export default function MatchHistoryPage() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const myNickname = user?.nickname || '게스트';

  const [stats, setStats] = useState<MatchStats | null>(null);
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 다시보기 모달 상태
  const [selectedMatch, setSelectedMatch] = useState<MatchDetail | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/yacht/matches/user/${encodeURIComponent(myNickname)}`);
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setMatches(data.recentMatches);
        }
      } catch (err) {
        console.error('Failed to fetch match stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [myNickname]);

  // 상세 경기 기록 모달 열기
  const handleOpenDetailModal = async (matchId: string) => {
    try {
      const res = await fetch(`/api/yacht/matches/${matchId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedMatch(data);
      }
    } catch (err) {
      console.error('Failed to fetch match detail:', err);
      alert('경기 상세 정보를 불러오는 데 실패했습니다.');
    }
  };

  if (!user) {
    return (
      <div className="p-16 text-center text-gray-900 dark:text-gray-100">
        <p className="mb-4 text-gray-900 dark:text-gray-200 font-medium">경기 기록을 확인하려면 로그인이 필요합니다.</p>
        <Link to="/login" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition">
          로그인하러 가기 ➔
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <span>🎮</span>
            <span>경기 기록 및 전적 대시보드</span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            <strong className="text-blue-600 dark:text-blue-400">{myNickname}</strong> 님의 요트 다이스 전적과 지난 게임 스코어보드를 복기하세요.
          </p>
        </div>

        <Link
          to="/profile"
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          ⬅️ 프로필로 돌아가기
        </Link>
      </div>

      {/* 1. 상단 종합 전적 카드 */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 rounded-2xl shadow-sm text-center transition-colors">
            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">총 전적</div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {stats.totalMatches}전 {stats.wins}승 {stats.losses}패
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 rounded-2xl shadow-sm text-center transition-colors">
            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">승률</div>
            <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
              {stats.winRate}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 rounded-2xl shadow-sm text-center transition-colors">
            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">최고 기록</div>
            <div className="text-2xl font-extrabold text-amber-500 dark:text-yellow-400">
              {stats.maxScore}점
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 rounded-2xl shadow-sm text-center transition-colors">
            <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">평균 점수</div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {stats.avgScore}점
            </div>
          </div>
        </div>
      )}

      {/* 2. 최근 경기 기록 리스트 */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm transition-colors">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <span>📜</span>
          <span>최근 경기 기록 ({matches.length}건)</span>
        </h3>

        {loading ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">경기 기록을 불러오는 중...</div>
        ) : matches.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/40">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">아직 완료된 경기 기록이 없습니다.</p>
            <Link
              to="/yacht"
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              지금 게임 플레이하러 가기 ➔
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {matches.map((m) => (
              <div key={m.matchId} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3.5">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                      m.isWin
                        ? 'bg-amber-100 text-amber-800 dark:bg-yellow-900/60 dark:text-yellow-300 border border-amber-300 dark:border-yellow-700'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {m.isWin ? '🏆 승리 (1위)' : `${m.rank}위`}
                  </span>

                  <div>
                    <h4 className="font-bold text-base text-gray-900 dark:text-white">{m.roomTitle}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date(m.playedAt).toLocaleString()} • 승자: <strong className="text-gray-700 dark:text-gray-300">{m.winnerNickname}</strong> ({m.winnerScore}점)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <div className="text-base font-extrabold text-blue-600 dark:text-blue-400">{m.myScore}점</div>
                    <div className="text-[11px] text-gray-400">내 최종 기록</div>
                  </div>

                  <button
                    onClick={() => handleOpenDetailModal(m.matchId)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition shadow-2xs"
                  >
                    📊 족보 다시보기
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. 📊 당시 스코어보드 다시보기 모달 팝업 */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 sm:p-7 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>📊</span>
                  <span>[{selectedMatch.roomTitle}] 경기 스코어보드</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  경기 일시: {new Date(selectedMatch.playedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* 스코어보드 표 */}
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl mb-4">
              <table className="w-full text-center text-xs">
                <thead>
                  <tr className="bg-gray-900 text-white font-bold">
                    <th className="p-2.5 text-left">족보 (Categories)</th>
                    {selectedMatch.participants.map((p) => (
                      <th key={p.id} className="p-2.5 min-w-[80px]">
                        {p.rank === 1 && '👑 '}
                        {p.nickname}
                        <div className="text-[10px] text-gray-300 font-normal">({p.rank}위)</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-gray-800 dark:text-gray-200">
                  {CATEGORIES.map((cat) => (
                    <tr key={cat} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="py-1.5 px-3 text-left font-medium text-gray-700 dark:text-gray-300">
                        {CATEGORY_LABELS[cat]}
                      </td>
                      {selectedMatch.participants.map((p) => (
                        <td key={p.id} className="py-1.5 px-2 font-semibold">
                          {p.scoresSheet[cat] !== undefined && p.scoresSheet[cat] !== null
                            ? p.scoresSheet[cat]
                            : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}

                  <tr className="bg-gray-900 text-white font-extrabold text-sm">
                    <td className="p-2.5 text-left">총점 (Total Score)</td>
                    {selectedMatch.participants.map((p) => (
                      <td key={p.id} className="p-2.5 text-amber-400">
                        {p.totalScore}점
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedMatch(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
