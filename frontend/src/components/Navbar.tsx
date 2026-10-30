import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

interface LoggedUser {
  id: string;
  email: string;
  nickname: string;
  title?: string;
  equippedTitle?: string | null;
}

export default function Navbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [authProfile, setAuthProfile] = useState<LoggedUser | null>(null);

  const loadAuth = () => {
    // 세션 또는 로컬스토리지에서 로그인된 유저 정보 로드
    const sessionSaved = sessionStorage.getItem('currentUser');
    const localSaved = localStorage.getItem('user');

    if (sessionSaved) {
      try {
        setAuthProfile(JSON.parse(sessionSaved));
        return;
      } catch {}
    }

    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        setAuthProfile(parsed);
        sessionStorage.setItem('currentUser', localSaved);
        return;
      } catch {}
    }

    // 로그인된 정보가 없으면 비로그인(게스트) 상태 유지
    setAuthProfile(null);
  };

  useEffect(() => {
    loadAuth();
    window.addEventListener('auth-change', loadAuth);
    return () => window.removeEventListener('auth-change', loadAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('currentUser');
    setAuthProfile(null);
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 px-6 py-3 flex justify-between items-center text-sm">
      <div className="flex items-center gap-6">
        <Link to="/" className="font-bold text-base text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
          ft_transcendence
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium">
          홈
        </Link>
        <Link to="/yacht" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium">
          요트 다이스
        </Link>
        <Link to="/drawing" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium">
          그림판
        </Link>
        <Link to="/ranking" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white font-medium">
          랭킹
        </Link>

        {/* 테마 토글 버튼 */}
        <button
          onClick={toggleTheme}
          className="border border-gray-300 dark:border-gray-600 px-2.5 py-1 text-xs font-medium bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>

        {authProfile ? (
          <div className="flex items-center gap-3 border border-gray-300 dark:border-gray-700 px-3 py-1 bg-gray-50 dark:bg-gray-800 text-xs">
            {authProfile.equippedTitle && (
              <span className="border border-gray-400 dark:border-gray-600 px-1.5 py-0.5 text-[11px] text-gray-700 dark:text-gray-300 font-medium">
                [{authProfile.equippedTitle}]
              </span>
            )}
            <Link to="/titles" className="text-gray-600 dark:text-gray-400 hover:underline">
              칭호목록
            </Link>
            <Link to="/profile" className="font-bold text-gray-900 dark:text-white hover:underline">
              {authProfile.nickname}
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-red-600 dark:text-red-400 hover:underline ml-1"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="border border-gray-300 dark:border-gray-600 px-3 py-1 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
              로그인
            </Link>
            <Link to="/signup" className="bg-blue-600 text-white px-3 py-1 text-xs font-medium hover:bg-blue-700">
              회원가입
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
