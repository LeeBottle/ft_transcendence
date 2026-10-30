import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import YachtBoard from './YachtBoard';

interface SlotData {
  isOpen: boolean;
  isAi: boolean;
  nickname: string | null;
  isReady: boolean;
}

interface RoomData {
  id: string;
  title: string;
  hostNickname: string;
  isPublic: boolean;
  slot1Ready: boolean;
  slot2Open: boolean;
  slot2IsAi: boolean;
  slot2Nick: string | null;
  slot2Ready: boolean;
  slot3Open: boolean;
  slot3IsAi: boolean;
  slot3Nick: string | null;
  slot3Ready: boolean;
  slot4Open: boolean;
  slot4IsAi: boolean;
  slot4Nick: string | null;
  slot4Ready: boolean;
}

export default function GameRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [room, setRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);

  const savedUser = sessionStorage.getItem('currentUser') || localStorage.getItem('user');
  const currentUser = savedUser ? JSON.parse(savedUser) : { nickname: '게스트', id: 'guest' };
  const myNickname = currentUser?.nickname || '게스트';

  const [slots, setSlots] = useState<{ [key: number]: SlotData }>({
    1: { isOpen: true, isAi: false, nickname: null, isReady: false },
    2: { isOpen: false, isAi: false, nickname: null, isReady: false },
    3: { isOpen: false, isAi: false, nickname: null, isReady: false },
    4: { isOpen: false, isAi: false, nickname: null, isReady: false },
  });

  const updateSlotsFromRoom = (data: RoomData) => {
    setRoom(data);
    setSlots({
      1: {
        isOpen: true,
        isAi: false,
        nickname: `${data.hostNickname} (방장)`,
        isReady: data.slot1Ready,
      },
      2: {
        isOpen: data.slot2Open,
        isAi: data.slot2IsAi,
        nickname: data.slot2Nick,
        isReady: data.slot2IsAi ? true : data.slot2Ready,
      },
      3: {
        isOpen: data.slot3Open,
        isAi: data.slot3IsAi,
        nickname: data.slot3Nick,
        isReady: data.slot3IsAi ? true : data.slot3Ready,
      },
      4: {
        isOpen: data.slot4Open,
        isAi: data.slot4IsAi,
        nickname: data.slot4Nick,
        isReady: data.slot4IsAi ? true : data.slot4Ready,
      },
    });
  };

  useEffect(() => {
    if (!roomId) return;

    let isMounted = true;

    const joinAndFetchRoom = async () => {
      try {
        const joinRes = await fetch(`/api/yacht/rooms/${roomId}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nickname: myNickname }),
        });

        if (!joinRes.ok) {
          const errData = await joinRes.json().catch(() => ({}));
          throw new Error(errData.message || '방에 입장할 수 없습니다.');
        }

        const data: RoomData = await joinRes.json();
        if (isMounted) {
          updateSlotsFromRoom(data);
          setLoading(false);
        }
      } catch (err: any) {
        console.error(err);
        alert(err.message || '방 입장 중 오류가 발생했습니다.');
        navigate('/yacht/choice');
      }
    };

    joinAndFetchRoom();

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/yacht/rooms/${roomId}`);
        if (res.ok) {
          const latestData: RoomData = await res.json();
          if (latestData && isMounted) {
            updateSlotsFromRoom(latestData);
          }
        }
      } catch (err) {}
    }, 1500);

    const exitRoom = () => {
      if (roomId && myNickname) {
        const payload = JSON.stringify({ nickname: myNickname });
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon(`/api/yacht/rooms/${roomId}/leave`, blob);
        } else {
          fetch(`/api/yacht/rooms/${roomId}/leave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      }
    };

    const handleBeforeUnload = () => {
      exitRoom();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      if (roomId && !window.location.pathname.includes(roomId)) {
        exitRoom();
      }
    };
  }, [roomId, myNickname, navigate]);

  const handleLeaveRoom = async () => {
    try {
      if (roomId && myNickname) {
        await fetch(`/api/yacht/rooms/${roomId}/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nickname: myNickname }),
        });
      }
    } catch (e) {
      console.error(e);
    }
    alert('방에서 퇴장합니다.');
    navigate('/yacht');
  };

  const handleToggleReady = async () => {
    try {
      const res = await fetch(`/api/yacht/rooms/${roomId}/ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: myNickname }),
      });
      if (res.ok) {
        const updatedData: RoomData = await res.json();
        updateSlotsFromRoom(updatedData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const openSlots = Object.values(slots).filter((s) => s.isOpen);

    if (
      openSlots.length >= 2 &&
      openSlots.every((s) => s.nickname !== null && s.isReady)
    ) {
      setIsGameStarted(true);
    }
  }, [slots]);

  if (isGameStarted) {
    return <YachtBoard roomId={roomId!} myNickname={myNickname} onLeave={handleLeaveRoom} />;
  }

  if (loading) {
    return <div className="text-center py-20 text-gray-500 text-sm">대기실 정보를 불러오는 중...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto my-8 p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700">
      <div className="flex justify-between items-center pb-3 mb-6 border-b border-gray-300 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-bold">
            {room?.title || '게임 대기실'}
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-0.5">Room ID: {roomId}</p>
        </div>
        <span className="text-xs border border-gray-300 dark:border-gray-600 px-2.5 py-1 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
          전원 준비 시 자동 시작
        </span>
      </div>

      {/* 2x2 슬롯 (각진 블록 박스) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
        {[1, 2, 3, 4].map((slotNum) => {
          const slot = slots[slotNum];

          if (!slot.isOpen) {
            return (
              <div
                key={slotNum}
                className="p-4 border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/40 text-center opacity-40"
              >
                <div className="text-xs text-gray-500 mb-1">Slot {slotNum}</div>
                <div className="text-sm font-medium text-gray-500">비활성화</div>
              </div>
            );
          }

          if (slot.nickname !== null) {
            const isMe =
              (slotNum === 1 && myNickname === room?.hostNickname) ||
              (slotNum !== 1 && slot.nickname === myNickname);

            return (
              <div
                key={slotNum}
                className={`p-4 border text-center ${
                  slot.isReady
                    ? 'border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'border-blue-600 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="text-xs text-gray-500 mb-1">Slot {slotNum}</div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-2">
                  {slot.nickname} {isMe && <span className="text-blue-600 dark:text-blue-400 font-normal">(나)</span>}
                </h4>

                <div className="text-xs mb-3 font-medium">
                  {slot.isReady ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">[준비 완료]</span>
                  ) : (
                    <span className="text-gray-500">[대기 중]</span>
                  )}
                </div>

                {isMe ? (
                  <button
                    onClick={handleToggleReady}
                    className={`w-full py-1.5 text-xs font-bold border ${
                      slot.isReady
                        ? 'border-gray-400 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        : 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {slot.isReady ? '준비 취소' : '준비'}
                  </button>
                ) : (
                  <div className="text-[11px] text-gray-400 py-1">
                    {slot.isAi ? 'AI 플레이어' : '대기 중'}
                  </div>
                )}
              </div>
            );
          }

          return (
            <div
              key={slotNum}
              className="p-4 border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-center"
            >
              <div className="text-xs text-gray-400 mb-1">Slot {slotNum}</div>
              <div className="text-xs text-gray-500 py-2">빈 슬롯 (입장 대기)</div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleLeaveRoom}
          className="px-4 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs hover:bg-gray-100"
        >
          방 나가기
        </button>
      </div>
    </div>
  );
}
