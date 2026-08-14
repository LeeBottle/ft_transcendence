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

  const savedUser = sessionStorage.getItem('currentUser');
  const currentUser = savedUser ? JSON.parse(savedUser) : { nickname: 'a' };
  const myNickname = currentUser?.nickname || 'a';

  // 슬롯 상태 관리 (초기값은 로딩 후 서버 데이터로 교체됨)
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

  // 1. 방 입장 (빈 슬롯 자동 배정) & 방 상태 폴링
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
        navigate('/Yacht/choice');
      }
    };

    joinAndFetchRoom();

    // 다른 유저의 입퇴장 및 준비 상태 반영을 위한 주기적 폴링 (1.5초)
    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/yacht/rooms/${roomId}`);
        if (res.ok) {
          const latestData: RoomData = await res.json();
          if (latestData && isMounted) {
            updateSlotsFromRoom(latestData);
          }
        }
      } catch (err) {
        // 백그라운드 폴링 실패 시 무시
      }
    }, 1500);

    // 자동 퇴장 처리 (탭 닫기, 새로고침, 타 메뉴로 페이지 이동 시)
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

      // React Router 이동 시: 브라우저 URL이 현재 방 페이지를 벗어났을 때만 퇴장/방 삭제 수행
      if (roomId && !window.location.pathname.includes(roomId)) {
        exitRoom();
      }
    };
  }, [roomId, myNickname, navigate]);

  // 2. 퇴장 및 슬롯 비우기
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
    navigate('/menu1');
  };

  // 3. 준비 / 대기 토글 (서버 API 호출)
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

  // 4. 오픈된 모든 슬롯의 플레이어 준비 완료 시 게임 시작 (2~4인 대응)
  useEffect(() => {
    const openSlots = Object.values(slots).filter((s) => s.isOpen);

    // 열려있는 모든 슬롯(2~4개)에 플레이어가 입장 완료했고, 모두 Ready 상태일 때 시작
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
    return <div style={{ padding: '20px', textAlign: 'center' }}>방 정보를 불러오는 중...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>🎮 {room?.title || '게임 대기실'} (Room ID: {roomId})</h2>

      {/* 2x2 슬롯 배치 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '15px',
          margin: '20px 0',
        }}
      >
        {[1, 2, 3, 4].map((slotNum) => {
          const slot = slots[slotNum];

          // 1) [🔒 사용 불가] 방 생성 시 '참여하지 않음'으로 설정된 슬롯
          if (!slot.isOpen) {
            return (
              <div
                key={slotNum}
                style={{
                  border: '1px solid #555',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#333',
                  color: '#888',
                  textAlign: 'center',
                }}
              >
                <h4>Slot {slotNum}</h4>
                <p>🔒 사용 불가</p>
              </div>
            );
          }

          // 2) [플레이어가 있는 경우] (유저 또는 AI)
          if (slot.nickname !== null) {
            const isMe =
              (slotNum === 1 && myNickname === room?.hostNickname) ||
              (slotNum !== 1 && slot.nickname === myNickname);

            return (
              <div
                key={slotNum}
                style={{
                  border: '2px solid #4A90E2',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#fff',
                  color: '#000',
                  textAlign: 'center',
                }}
              >
                <h4>
                  {slotNum === 1 && '👑 '}
                  {slot.nickname}
                  {isMe && <span style={{ fontSize: '12px', color: '#4A90E2', marginLeft: '5px' }}>(나)</span>}
                </h4>

                {/* 플레이어가 존재하는 경우에만 준비/대기 표시 */}
                <p>상태: {slot.isReady ? '✅ 준비 완료' : '⏳ 대기 중'}</p>

                {/* 본인일 때만 토글 버튼 노출 */}
                {isMe && (
                  <button
                    onClick={handleToggleReady}
                    style={{ padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' }}
                  >
                    {slot.isReady ? '준비 취소' : '준비 하기'}
                  </button>
                )}
              </div>
            );
          }

          // 3) [플레이어가 들어오지 않은 열린 슬롯]
          return (
            <div
              key={slotNum}
              style={{
                border: '1px dashed #aaa',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#fafafa',
                color: '#666',
                textAlign: 'center',
              }}
            >
              <h4>Slot {slotNum}</h4>
              <p>플레이어 들어오지 않음</p>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'right' }}>
        <button onClick={handleLeaveRoom} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          방 나가기
        </button>
      </div>
    </div>
  );
}