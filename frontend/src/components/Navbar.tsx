import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface LoggedUser {
  id: string;
  email: string;
  nickname: string;
  title?: string;
  equippedTitle?: string | null;
}

export default function Navbar() {
  const navigate = useNavigate();
  const [authProfile, setAuthProfile] = useState<LoggedUser | null>(null);

  const loadAuth = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setAuthProfile(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
        setAuthProfile(null);
      }
    } else {
      setAuthProfile(null);
    }
  };

  useEffect(() => {
    loadAuth();
    window.addEventListener('auth-change', loadAuth);
    return () => window.removeEventListener('auth-change', loadAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center px-8">
      <h1 className="text-xl font-bold text-white flex items-center gap-4">
        <Link to="/">ft_transcendence</Link>
      </h1>

      <div className="flex gap-6 items-center">
        <Link to="/" className="text-gray-300 hover:text-white font-medium">홈</Link>
        <Link to="/lobby" className="text-gray-300 hover:text-white font-medium">게임 로비</Link>
        <Link to="/social" className="text-gray-300 hover:text-white font-medium">소셜</Link>
        <Link to="/ranking" className="text-gray-300 hover:text-white font-medium">랭킹</Link>
        <Link to="/drawing" className="text-gray-300 hover:text-white font-medium">그림판</Link>

        {authProfile ? (
          <div className="flex items-center gap-3 bg-gray-900 px-3.5 py-1.5 rounded-full border border-green-500 text-sm">
            {authProfile.equippedTitle && (
              <span className="text-xs bg-blue-900/80 text-blue-300 px-2 py-0.5 rounded-md border border-blue-700 font-semibold">
                🏆 {authProfile.equippedTitle}
              </span>
            )}
            <Link to="/profile" className="text-white font-semibold hover:text-blue-300">
              {authProfile.nickname} 님
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div className="flex gap-3 items-center">
            <Link to="/login" className="text-gray-300 hover:text-white font-medium">로그인</Link>
            <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition">
              회원가입
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
