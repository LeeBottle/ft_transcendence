import { useState, useEffect } from 'react';

// DB에서 받아올 유저 객체의 데이터 타입 정의
interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // 1. 백엔드에서 유저 목록 가져오기 (GET)
  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:3000/users');
      if (!res.ok) throw new Error('데이터를 불러오지 못했습니다.');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setStatusMessage(`조회 에러: ${err.message}`);
    }
  };

  // 컴포넌트 첫 실행 시 목록 조회
  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. 새로운 유저 생성 (POST)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email }),
      });

      if (!res.ok) throw new Error('유저 생성에 실패했습니다.');

      setStatusMessage('유저 등록 성공!');
      setUsername('');
      setEmail('');
      fetchUsers(); // 생성 후 목록 새로고침
    } catch (err: any) {
      setStatusMessage(`생성 에러: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
      <h2>Transcendence 유저 연동 테스트</h2>

      {/* 입력 폼 */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="유저명 (예: cadet)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ padding: '8px', marginRight: '10px' }}
          />
          <input
            type="email"
            placeholder="이메일 (예: cadet@student.42.fr)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '8px', marginRight: '10px' }}
          />
          <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>
            DB에 저장
          </button>
        </div>
      </form>

      {statusMessage && <p style={{ color: 'blue' }}>{statusMessage}</p>}

      {/* DB 유저 목록 */}
      <h3>현재 DB 유저 목록 ({users.length}명)</h3>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <strong>ID: {user.id}</strong> | {user.username} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
}