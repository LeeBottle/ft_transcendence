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

  const [selectedRoom, setSelectedRoom] = useState<RoomItem | null>(null);
  const [inputPassword, setInputPassword] = useState<string>('');

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

  const getPlayerCountInfo = (room: RoomItem) => {
    let current = 1;
    if (room.slot2Nick) current += 1;
    if (room.slot3Nick) current += 1;
    if (room.slot4Nick) current += 1;

    let max = 1;
    if (room.slot2Open) max += 1;
    if (room.slot3Open) max += 1;
    if (room.slot4Open) max += 1;

    return { current, max };
  };

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
      setSelectedRoom(room);
      setInputPassword('');
    } else {
      navigate(`/yacht/room/${room.id}`);
    }
  };

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
    navigate(`/yacht/room/${roomId}`);
  };

  const publicRooms = rooms.filter((r) => r.isPublic);

  return (
    <div className="max-w-4xl mx-auto my-8 px-4">
      <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-300 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            게임 방 목록
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">참여할 대기실을 선택하세요.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => fetchRooms()}
            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            새로고침
          </button>
          <button
            onClick={() => navigate('/yacht/make')}
            className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
          >
            방 만들기
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500 text-sm">목록 불러오는 중...</div>
      ) : publicRooms.length === 0 ? (
        <div className="text-center py-12 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            개설된 공개 방이 없습니다.
          </p>
          <button
            onClick={() => navigate('/yacht/make')}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
          >
            첫 번째 방 만들기
          </button>
        </div>
      ) : (
        <div className="border border-gray-300 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
          {publicRooms.map((room) => {
            const { current, max } = getPlayerCountInfo(room);
            const isFull = current >= max;

            return (
              <div
                key={room.id}
                onClick={() => handleRoomClick(room)}
                className={`flex justify-between items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer ${
                  isFull || room.isGameStart ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800/40' : ''
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">{room.title}</h3>
                    {room.password && <span className="text-xs text-gray-500 font-mono">[비밀번호]</span>}
                    {!room.isPublic && (
                      <span className="text-[11px] border border-gray-300 dark:border-gray-600 px-1 py-0.2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        비공개
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    방장: {room.hostNickname}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right text-xs">
                    <div className="font-bold text-gray-900 dark:text-white">
                      인원: {current} / {max}
                    </div>
                    <div className="text-gray-500 text-[11px]">
                      {room.isGameStart ? '게임 중' : isFull ? '인원 마감' : '대기 중'}
                    </div>
                  </div>

                  <button
                    disabled={isFull || room.isGameStart}
                    className={`px-3 py-1.5 text-xs font-medium border ${
                      isFull || room.isGameStart
                        ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {room.password ? '비밀번호 입장' : '입장'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => navigate('/yacht')}
          className="px-3.5 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100"
        >
          로비로 돌아가기
        </button>
      </div>

      {/* 비밀번호 모달 (심플 사각 블록) */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6 max-w-sm w-full">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">비밀번호 입력</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
              [{selectedRoom.title}] 방의 비밀번호를 입력하세요.
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none mb-4"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => {
                  setSelectedRoom(null);
                  setInputPassword('');
                }}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-100"
              >
                취소
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="px-4 py-1.5 bg-blue-600 text-white font-bold hover:bg-blue-700"
              >
                입장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
