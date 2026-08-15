import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface LoggedUser {
  id: string;
  email: string;
  nickname: string;
}

export default function Navbar() {
  const navigate = useNavigate();
  const [authProfile, setAuthProfile] = useState<LoggedUser | null>(null);

  const loadAuth = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setAuthProfile(JSON.parse(storedUser));
      } catch (e) {
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
        <Link to="/" className="text-gray-300 hover:text-white font-medium">
          홈
        </Link>
        <Link to="/menu1" className="text-gray-300 hover:text-white font-medium">
          메뉴 1
        </Link>
        <Link to="/menu2" className="text-gray-300 hover:text-white font-medium">
          메뉴 2
        </Link>
        <Link to="/menu3" className="text-gray-300 hover:text-white font-medium">
          메뉴 3
        </Link>

        {authProfile ? (
          <div className="flex items-center gap-3 bg-gray-900 px-3 py-1.5 rounded-full border border-green-500 text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-white font-semibold">{authProfile.nickname} 님</span>
            <button
              onClick={handleLogout}
              className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div className="flex gap-3 items-center">
            <Link to="/login" className="text-gray-300 hover:text-white font-medium">
              로그인
            </Link>
            <Link
              to="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition"
            >
              회원가입
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
