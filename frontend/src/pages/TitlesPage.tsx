import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface User {
  nickname: string;
  title?: string | null;
  equippedTitle?: string | null;
  unlockedTitles?: string | null;
}

interface TitleDefinition {
  id: string;
  name: string;
  condition: string;
}

const ALL_TITLES: TitleDefinition[] = [
  {
    id: 'SLIDER_BEGINNER',
    name: '초급 슬라이더',
    condition: '회원가입 및 퍼즐 캡차 최초 인증 성공 시 획득',
  },
  {
    id: 'YACHT_MASTER',
    name: '요트 마스터',
    condition: '주사위 5개가 일치하는 Yacht(50점) 족보 기록 시 획득',
  },
  {
    id: 'FIRST_VICTORY',
    name: '첫 승리의 주역',
    condition: '멀티플레이 2인 이상 게임에서 첫 1위 달성 시 획득',
  },
  {
    id: 'WIN_STREAK',
    name: '불꽃 연승',
    condition: '멀티플레이 게임에서 연속 3연승 달성 시 획득',
  },
  {
    id: 'AI_BREAKER',
    name: 'AI 브레이커',
    condition: 'AI 봇과의 대결에서 승리 시 획득',
  },
  {
    id: 'SPEED_RUNNER',
    name: '스피드 러너',
    condition: '퍼즐 캡차를 3초 이내에 초고속 통과 시 획득',
  },
  {
    id: 'PICASSO',
    name: '거리의 화가',
    condition: '협업 그림판에서 20회 이상 드로잉 달성 시 획득',
  },
];

export default function TitlesPage() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('currentUser') || localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // 🔄 마운트 시 서버 DB로부터 최신 칭호 목록(unlockedTitles) 실시간 동기화
  useEffect(() => {
    if (!user) return;

    const syncLatestUser = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        let res: Response | null = null;

        if (token) {
          res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        // 토큰이 없거나 만료되었을 경우 닉네임 기준으로 DB 최신 정보 동기화
        if (!res || !res.ok) {
          res = await fetch(`/api/auth/user/${encodeURIComponent(user.nickname)}`);
        }

        if (res && res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            sessionStorage.setItem('currentUser', JSON.stringify(data.user));
            window.dispatchEvent(new Event('auth-change'));
          }
        }
      } catch (err) {
        console.error('Failed to sync user titles:', err);
      }
    };

    syncLatestUser();
  }, [user?.nickname]);

  if (!user) {
    return (
      <div className="p-16 text-center text-gray-900 dark:text-gray-100">
        <p className="mb-4 text-sm font-medium">칭호를 확인하려면 로그인이 필요합니다.</p>
        <Link to="/login" className="px-4 py-2 bg-blue-600 text-white text-xs font-bold hover:bg-blue-700">
          로그인
        </Link>
      </div>
    );
  }

  // 🎯 대표 칭호 장착 / 해제 요청 (실시간 교체)
  const equipTitle = async (title: string | null) => {
    try {
      const token = localStorage.getItem('accessToken');

      const res = await fetch('/api/auth/title', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title,
          nickname: user.nickname,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || '칭호 변경 실패');
        return;
      }

      const data = await res.json();
      const updatedUser = data.user;

      localStorage.setItem('user', JSON.stringify(updatedUser));
      sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event('auth-change'));
    } catch (err) {
      console.error('Title equip error:', err);
    }
  };

  // 보유한 칭호 목록 판정
  const unlockedList = (user.unlockedTitles || '초급 슬라이더')
    .split(',')
    .map((t) => t.trim());

  const isUnlocked = (titleName: string) => {
    if (titleName === '초급 슬라이더') return true;
    return unlockedList.includes(titleName) || user.title === titleName;
  };

  // 🎯 [요구사항 3] 받은 칭호는 자동으로 상단에 나열하고, 없는 칭호는 가진 칭호 아래에 나열!
  const sortedTitles = [...ALL_TITLES].sort((a, b) => {
    const aUnlocked = isUnlocked(a.name);
    const bUnlocked = isUnlocked(b.name);
    const aEquipped = user.equippedTitle === a.name;
    const bEquipped = user.equippedTitle === b.name;

    // 1순위: 현재 착용 중인 칭호가 맨 위
    if (aEquipped && !bEquipped) return -1;
    if (!aEquipped && bEquipped) return 1;

    // 2순위: 보유한 칭호가 그 다음 (상단 배치)
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;

    // 3순위: 미보유 칭호는 아래쪽 배치 (기본 순서 유지)
    return 0;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 my-8">
      <div className="mb-6 pb-3 border-b border-gray-300 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          칭호 보관함
        </h2>
        <p className="mt-1 text-xs text-gray-900 dark:text-gray-300 font-medium">
          보유한 칭호는 상단에 나열되며, 우측 버튼을 눌러 대표 칭호를 자유롭게 변경할 수 있습니다.
        </p>
      </div>

      {/* 한 줄에 하나의 칭호만 길게 배치 (1열 정렬 리스트) */}
      <div className="flex flex-col gap-3">
        {sortedTitles.map((t) => {
          const unlocked = isUnlocked(t.name);
          const isEquipped = user.equippedTitle === t.name;

          // 1) 보유한 칭호 (연한 노란색 박스 + 우측 장착 버튼)
          if (unlocked) {
            return (
              <div
                key={t.id}
                className={`border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isEquipped
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/40 text-gray-900 dark:text-white'
                    : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                }`}
              >
                {/* 좌측: 칭호 이름 및 조건 설명 */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">[보유]</span>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">{t.name}</h3>
                    {isEquipped && (
                      <span className="text-[11px] font-bold border border-yellow-500 px-1.5 py-0.2 bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-200">
                        착용 중
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-900 dark:text-gray-200 font-medium">
                    {t.condition}
                  </p>
                </div>

                {/* 우측: 장착/해제 버튼 */}
                <div className="sm:text-right shrink-0">
                  <button
                    onClick={() => equipTitle(isEquipped ? null : t.name)}
                    className={`px-4 py-2 text-xs font-bold border min-w-[110px] ${
                      isEquipped
                        ? 'border-yellow-600 bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isEquipped ? '장착 해제' : '대표 칭호 장착'}
                  </button>
                </div>
              </div>
            );
          }

          // 2) 미보유 칭호 (하단 배치, 회색 직사각형 박스 + 우측 미달성 비활성 버튼)
          return (
            <div
              key={t.id}
              className="border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-75"
            >
              {/* 좌측: 칭호 이름 및 달성 조건 */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-500">[미보유]</span>
                  <h3 className="font-bold text-base text-gray-800 dark:text-gray-200">{t.name}</h3>
                </div>
                <p className="text-xs text-gray-900 dark:text-gray-200 font-medium">
                  <strong>조건:</strong> {t.condition}
                </p>
              </div>

              {/* 우측: 비활성화 버튼 */}
              <div className="sm:text-right shrink-0">
                <button
                  disabled
                  className="px-4 py-2 text-xs font-medium border border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed min-w-[110px]"
                >
                  미달성
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
