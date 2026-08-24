import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (!user) {
    return <div className="p-12 text-center text-gray-400">로그인이 필요합니다.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h2 className="text-3xl font-bold mb-2">{user.nickname} 님의 페이지</h2>
      <p className="text-gray-400 mb-8">원하는 메뉴를 선택하세요.</p>

      <nav className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
          <h3 className="font-bold text-lg">👤 프로필 정보</h3>
          <p className="mt-1 text-sm text-gray-400">닉네임과 아바타 관리</p>
        </div>

        <Link to="/titles" className="rounded-xl border border-gray-700 bg-gray-800 p-5 hover:border-amber-400">
          <h3 className="font-bold text-lg">🏆 칭호 컬렉션</h3>
          <p className="mt-1 text-sm text-gray-400">획득한 칭호 확인 및 대표 칭호 설정</p>
        </Link>

        <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
          <h3 className="font-bold text-lg">🎮 경기 기록</h3>
          <p className="mt-1 text-sm text-gray-400">전적과 최근 경기 확인</p>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-800 p-5">
          <h3 className="font-bold text-lg">⚙️ 계정 설정</h3>
          <p className="mt-1 text-sm text-gray-400">계정 관련 설정</p>
        </div>
      </nav>
    </div>
  );
}
