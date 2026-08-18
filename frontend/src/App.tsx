import { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginInput, setLoginInput] = useState('');
  
  // 수동 등록 폼용 상태
  const [createUsername, setCreateUsername] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const [users, setUsers] = useState<User[]>([]);

  // 1. 초기 세션 복구 및 전체 유저 목록 로드 (GET)
  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:3000/users');
      if (!res.ok) throw new Error('목록 조회 실패');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      console.error('유저 목록 조회 실패:', err);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('logged_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    fetchUsers();
  }, []);

  // 2. 간이 로그인 요청 (POST /users/login)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginInput.trim()) return;

    try {
      const res = await fetch('http://localhost:3000/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginInput.trim() }),
      });
      if (!res.ok) throw new Error('로그인 실패');
      const userData = await res.json();

      setCurrentUser(userData);
      localStorage.setItem('logged_user', JSON.stringify(userData));
      setLoginInput('');
      fetchUsers();
    } catch (err: any) {
      alert('로그인에 실패했습니다.');
    }
  };

  // 3. 로그아웃
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('logged_user');
  };

  // 4. 수동 유저 생성 (POST /users)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: createUsername, email: createEmail }),
      });

      if (!res.ok) throw new Error('유저 생성에 실패했습니다.');

      setStatusMessage('새 유저 등록 완료!');
      setCreateUsername('');
      setCreateEmail('');
      fetchUsers(); // 생성 후 목록 갱신
    } catch (err: any) {
      setStatusMessage(`생성 에러: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '700px' }}>
      <h2>🏓 Transcendence 대시보드</h2>

      {/* [섹션 1] 간이 로그인 영역 */}
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
        <h3>🔑 간이 로그인</h3>
        {currentUser ? (
          <div style={{ background: '#eef2ff', padding: '10px 15px', borderRadius: '6px' }}>
            <p><strong>환영합니다, {currentUser.username}님!</strong></p>
            <p style={{ margin: '5px 0' }}>내 DB 고유번호: ID {currentUser.id}</p>
            <p style={{ margin: '5px 0' }}>내 이메일: {currentUser.email}</p>
            <button onClick={handleLogout} style={{ marginTop: '10px', padding: '6px 12px', cursor: 'pointer' }}>
              로그아웃
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="유저명 입력 (예: cadet)"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              style={{ padding: '8px', marginRight: '10px' }}
            />
            <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>
              로그인 / 자동가입
            </button>
          </form>
        )}
      </div>

      {/* [섹션 2] 수동 유저 등록 폼 */}
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
        <h3>📝 수동 유저 생성 (DB 직접 등록)</h3>
        <form onSubmit={handleCreateUser}>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="유저명 (예: custom_user)"
              value={createUsername}
              onChange={(e) => setCreateUsername(e.target.value)}
              required
              style={{ padding: '8px', marginRight: '10px' }}
            />
            <input
              type="email"
              placeholder="이메일 (예: user@example.com)"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              required
              style={{ padding: '8px', marginRight: '10px' }}
            />
            <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>
              DB에 저장
            </button>
          </div>
        </form>
        {statusMessage && <p style={{ color: '#2563eb', margin: '5px 0' }}>{statusMessage}</p>}
      </div>

      {/* [섹션 3] 전체 DB 유저 목록 */}
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
        <h3>👥 전체 DB 유저 목록 ({users.length}명)</h3>
        <ul>
          {users.map((u) => (
            <li key={u.id} style={{ marginBottom: '6px', fontWeight: u.id === currentUser?.id ? 'bold' : 'normal' }}>
              ID {u.id} : {u.username} ({u.email}) {u.id === currentUser?.id && ' 👈 (현재 로그인된 나)'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}