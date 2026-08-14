import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const DUMMY_USERS = [
  { id: '1', nickname: 'a', email: 'a@test.com' },
  { id: '2', nickname: 'b', email: 'b@test.com' },
  { id: '3', nickname: 'c', email: 'c@test.com' },
  { id: '4', nickname: 'd', email: 'd@test.com' },
];

export default function Navbar() {
  const [currentUser, setCurrentUser] = useState<typeof DUMMY_USERS[0] | null>(null);

  useEffect(() => {
    // 탭 개별 저장소인 sessionStorage에서 유저 정보 불러오기
    const saved = sessionStorage.getItem('currentUser');
    if (saved) {
      setCurrentUser(JSON.parse(saved));
    } else {
      // 기본값: 첫 번째 탭은 유저 a 로 설정
      sessionStorage.setItem('currentUser', JSON.stringify(DUMMY_USERS[0]));
      setCurrentUser(DUMMY_USERS[0]);
    }
  }, []);

  const handleSelectUser = (userId: string) => {
    const user = DUMMY_USERS.find((u) => u.id === userId);
    if (user) {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentUser(user);
      // 유저 변경 시 페이지 새로고침하여 소켓/상태 재연결
      window.location.reload();
    }
  };

  return (
    <nav className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center px-8">
      <h1 className="text-xl font-bold text-white flex items-center gap-4">
        <Link to="/">ft_transcendence</Link>
      </h1>

      <div className="flex gap-6 items-center">
        {/* 개발 테스트용 유저 선택 셀렉트 박스 */}
        <div className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-md text-sm text-white">
          <span>👤 테스트 로그인:</span>
          <select
            value={currentUser?.id || '1'}
            onChange={(e) => handleSelectUser(e.target.value)}
            className="bg-gray-900 text-white px-2 py-1 rounded border border-gray-600 cursor-pointer"
          >
            {DUMMY_USERS.map((user) => (
              <option key={user.id} value={user.id}>
                {user.nickname} ({user.email})
              </option>
            ))}
          </select>
        </div>

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
      </div>
    </nav>
  );
}