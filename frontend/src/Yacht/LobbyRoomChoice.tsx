import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface RoomItem {
  id: string;
  title: string;
  hostNickname: string;
  password?: string | null;
  isPublic: boolean;
  currentPlayers: number;
  maxPlayers: number;
  isGameStart: boolean;
  createdAt: string;

  slot2Open: boolean;
  slot2IsAi: boolean;
  slot2Nick: string | null;

  slot3Open: boolean;
  slot3IsAi: boolean;
  slot3Nick: string | null;

  slot4Open: boolean;
  slot4IsAi: boolean;
  slot4Nick: string | null;
}

export default function LobbyRoomChoice() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 비밀번호 입력 모달 상태
  const [selectedRoom, setSelectedRoom] = useState<RoomItem | null>(null);
  const [inputPassword, setInputPassword] = useState<string>('');

  // 방 목록 가져오기 함수 (배그라운드 폴링 시 loading 상태 변경 안 함)
  const fetchRooms = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await fetch('/api/yacht/rooms');
      if (!res.ok) throw new Error('방 목록을 불러오지 못했습니다.');
      const data: RoomItem[] = await res.json();
      setRooms(data);
    } catch (err) {
      console.error(err);
      if (!isBackground) alert('방 목록을 가져오는 중 오류가 발생했습니다.');
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(() => {
      fetchRooms(true);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // 실제 현재 인원수 및 최대 인원수 계산
  const getPlayerCountInfo = (room: RoomItem) => {
    let current = 1; // 방장 (P1)
    if (room.slot2Nick) current += 1;
    if (room.slot3Nick) current += 1;
    if (room.slot4Nick) current += 1;

    let max = 1; // 방장 (P1)
    if (room.slot2Open) max += 1;
    if (room.slot3Open) max += 1;
    if (room.slot4Open) max += 1;

    return { current, max };
  };

  // 방 클릭 시 입장 처리
  const handleRoomClick = (room: RoomItem) => {
    const { current, max } = getPlayerCountInfo(room);

    if (room.isGameStart) {
      alert('이미 게임이 시작된 방입니다.');
      return;
    }

    if (current >= max) {
      alert('방 인원이 모두 찼습니다.');
      return;
    }

    if (room.password) {
      // 비밀번호가 있는 방인 경우 비밀번호 입력 모달 오픈
      setSelectedRoom(room);
      setInputPassword('');
    } else {
      // 비밀번호가 없으면 바로 대기실로 이동
      navigate(`/Yacht/room/${room.id}`);
    }
  };

  // 비밀번호 검증 후 입장
  const handlePasswordSubmit = () => {
    if (!selectedRoom) return;

    if (!inputPassword.trim()) {
      alert('비밀번호를 입력해 주세요.');
      return;
    }

    if (selectedRoom.password !== inputPassword.trim()) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    const roomId = selectedRoom.id;
    setSelectedRoom(null);
    setInputPassword('');
    navigate(`/Yacht/room/${roomId}`);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>🎲 게임 방 선택</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={fetchRooms}
            style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: '6px' }}
          >
            🔄 새로고침
          </button>
          <button
            onClick={() => navigate('/Yacht/make')}
            style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: '6px', fontWeight: 'bold' }}
          >
            ➕ 방 만들기
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>방 목록을 불러오는 중...</div>
      ) : rooms.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            border: '2px dashed #ccc',
            borderRadius: '12px',
            backgroundColor: '#fafafa',
          }}
        >
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '15px' }}>
            현재 생성된 방이 없습니다.
          </p>
          <button
            onClick={() => navigate('/Yacht/make')}
            style={{ padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            첫 번째 방 만들기
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {rooms.map((room) => {
            const { current, max } = getPlayerCountInfo(room);
            const isFull = current >= max;

            return (
              <div
                key={room.id}
                onClick={() => handleRoomClick(room)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  border: isFull ? '1px solid #ddd' : '2px solid #4A90E2',
                  borderRadius: '10px',
                  backgroundColor: isFull ? '#f9f9f9' : '#fff',
                  cursor: isFull || room.isGameStart ? 'not-allowed' : 'pointer',
                  opacity: isFull || room.isGameStart ? 0.7 : 1,
                  transition: 'transform 0.1s, box-shadow 0.1s',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>{room.title}</h3>
                    {room.password && <span>🔒</span>}
                    {!room.isPublic && (
                      <span style={{ fontSize: '12px', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                        비공개
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    방장: <strong>{room.hostNickname}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: isFull ? '#e53e3e' : '#2b6cb0' }}>
                      👥 인원: {current} / {max}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {room.isGameStart ? '🔴 게임 중' : isFull ? '⚠️ 만원' : '🟢 대기 중'}
                    </div>
                  </div>

                  <button
                    disabled={isFull || room.isGameStart}
                    style={{
                      padding: '8px 16px',
                      cursor: isFull || room.isGameStart ? 'not-allowed' : 'pointer',
                      borderRadius: '6px',
                      backgroundColor: isFull || room.isGameStart ? '#ccc' : '#4A90E2',
                      color: 'white',
                      border: 'none',
                      fontWeight: 'bold',
                    }}
                  >
                    {room.password ? '비밀번호 입장' : '입장하기'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 뒤로 가기 버튼 */}
      <div style={{ marginTop: '25px', textAlign: 'left' }}>
        <button
          onClick={() => navigate('/menu1')}
          style={{ padding: '10px 20px', cursor: 'pointer', borderRadius: '6px' }}
        >
          ⬅️ 로비로 돌아가기
        </button>
      </div>

      {/* 🔒 비밀번호 입력 모달 */}
      {selectedRoom && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '12px',
              width: '320px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ marginTop: 0 }}>🔒 비밀번호 입력</h3>
            <p style={{ fontSize: '14px', color: '#555', marginBottom: '15px' }}>
              <strong>[{selectedRoom.title}]</strong> 방에 입장하려면 비밀번호를 입력해 주세요.
            </p>
            <input
              type="password"
              placeholder="비밀번호"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePasswordSubmit();
              }}
              autoFocus
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  setSelectedRoom(null);
                  setInputPassword('');
                }}
                style={{ padding: '8px 14px', cursor: 'pointer', borderRadius: '6px' }}
              >
                취소
              </button>
              <button
                onClick={handlePasswordSubmit}
                style={{ padding: '8px 14px', cursor: 'pointer', borderRadius: '6px', backgroundColor: '#4A90E2', color: 'white', border: 'none', fontWeight: 'bold' }}
              >
                입장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
