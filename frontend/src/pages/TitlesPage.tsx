import { useState } from 'react';
import { Link } from 'react-router-dom';

interface User {
  nickname: string;
  title?: string | null;
  equippedTitle?: string | null;
}

export default function TitlesPage() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  if (!user) {
    return (
      <div className="p-12 text-center">
        <p className="mb-4 text-gray-300">칭호를 확인하려면 로그인이 필요합니다.</p>
        <Link to="/login" className="text-blue-400 hover:underline">로그인</Link>
      </div>
    );
  }

  const equipTitle = async (title: string | null) => {
    const res = await fetch('/api/auth/title', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) return;

    const data = await res.json();
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    window.dispatchEvent(new Event('auth-change'));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">🏆 칭호 컬렉션</h2>
        <p className="mt-2 text-gray-400">획득한 칭호를 모으고 대표 칭호를 설정하세요.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {user.title ? (
          <article className={`rounded-xl border p-5 ${
            user.equippedTitle === user.title
              ? 'border-amber-400 bg-amber-950/30'
              : 'border-gray-700 bg-gray-800'
          }`}>
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="font-bold text-lg">{user.title}</h3>
            <p className="text-sm text-gray-400 mt-1">첫 로그인을 완료한 슬라이더</p>
            <button
              onClick={() => equipTitle(user.equippedTitle === user.title ? null : user.title!)}
              className="mt-5 w-full rounded bg-blue-600 hover:bg-blue-700 px-3 py-2 text-sm font-semibold"
            >
              {user.equippedTitle === user.title ? '대표 칭호 해제' : '대표 칭호 설정'}
            </button>
          </article>
        ) : (
          <p className="text-gray-400">아직 획득한 칭호가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
