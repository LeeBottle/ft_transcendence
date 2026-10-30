import { useState, useEffect } from 'react';

interface LeaderboardItem {
  rank: number;
  id: string;
  nickname: string;
  avatar: string;
  equippedTitle: string;
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: string;
  maxScore: number;
}

export default function RankingPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRanking = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/yacht/ranking');
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error('Failed to fetch ranking:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking();
  }, []);

  return (
    <div className="max-w-4xl mx-auto my-8 px-4 text-gray-900 dark:text-white">
      <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-300 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-bold">
            실시간 랭킹 순위표
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            승리 횟수와 최고 점수 기준 순위입니다.
          </p>
        </div>

        <button
          onClick={fetchRanking}
          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          새로고침
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500 text-sm">랭킹 집계 중...</div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-16 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-sm text-gray-500">
          등록된 전적 데이터가 없습니다.
        </div>
      ) : (
        <div className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-750 border-b border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold">
                <th className="py-2.5 px-4 text-center w-16">순위</th>
                <th className="py-2.5 px-4">플레이어</th>
                <th className="py-2.5 px-4">대표 칭호</th>
                <th className="py-2.5 px-4 text-center">전적</th>
                <th className="py-2.5 px-4 text-center">승률</th>
                <th className="py-2.5 px-4 text-right">최고 기록</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {leaderboard.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-750 ${
                    item.rank === 1 ? 'bg-yellow-50/50 dark:bg-yellow-950/20 font-bold' : ''
                  }`}
                >
                  <td className="py-3 px-4 text-center font-bold">
                    {item.rank}위
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    {item.nickname}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    [{item.equippedTitle}]
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                    {item.wins}승 {item.losses}패 ({item.totalMatches}전)
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-blue-600 dark:text-blue-400">
                    {item.winRate}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-gray-900 dark:text-white">
                    {item.maxScore}점
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
