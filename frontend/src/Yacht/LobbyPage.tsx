import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LobbyPage() {
  const navigate = useNavigate();

  // 팝업 단계 관리 ('NONE' | 'ID_INPUT' | 'PASSWORD_INPUT')
  const [modalStage, setModalStage] = useState<'NONE' | 'ID_INPUT' | 'PASSWORD_INPUT'>('NONE');

  // 입력값 상태 관리
  const [searchRoomId, setSearchRoomId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');

  // 1. [방 만들기] 이동
  const handleGoToMakePage = () => {
    navigate('/Yacht/make');
  };

  // 2. [방 참여하기] 방 리스트 선택 페이지로 이동
  const handleGoToRoomChoice = () => {
    navigate('/Yacht/choice');
  };

  // 3. ID 입력 후 다음 단계 처리 (비밀번호 존재 여부 체크)
  const handleNextStep = async () => {
    if (!searchRoomId.trim()) {
      alert('방 ID를 입력해 주세요.');
      return;
    }

    try {
      const response = await fetch(`/api/yacht/rooms/${searchRoomId.trim()}`);
      if (!response.ok) {
        alert('존재하지 않는 방 ID입니다.');
        return;
      }
      const room = await response.json();
      if (!room) {
        alert('존재하지 않는 방 ID입니다.');
        return;
      }

      if (room.password) {
        setModalStage('PASSWORD_INPUT');
      } else {
        setModalStage('NONE');
        navigate(`/Yacht/room/${room.id}`);
      }
    } catch (err) {
      console.error(err);
      alert('방 정보를 조회하는 중 오류가 발생했습니다.');
    }
  };

  // 4. 비밀번호 입력 후 최종 입장 처리
  const handleFinalJoin = async () => {
    if (!roomPassword.trim()) {
      alert('비밀번호를 입력해 주세요.');
      return;
    }

    try {
      const response = await fetch(`/api/yacht/rooms/${searchRoomId.trim()}`);
      if (!response.ok) {
        alert('존재하지 않는 방입니다.');
        return;
      }
      const room = await response.json();
      if (room.password && room.password !== roomPassword.trim()) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }

      setModalStage('NONE');
      navigate(`/Yacht/room/${room.id}`);
    } catch (err) {
      console.error(err);
      alert('입장 처리 중 오류가 발생했습니다.');
    }
  };

  // 팝업 초기화 및 닫기
  const handleCloseModal = () => {
    setModalStage('NONE');
    setSearchRoomId('');
    setRoomPassword('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🎲 Yacht Dice 로비</h2>

      {/* 둥근 사각형 길게 3개 배치 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        
        {/* 1번째 카드: 방 만들기 */}
        <div
          onClick={handleGoToMakePage}
          style={{
            border: '2px solid #ccc',
            borderRadius: '16px',
            padding: '20px',
            cursor: 'pointer',
          }}
        >
          <h3>➕ 방 만들기</h3>
          <p>새로운 게임 방을 생성하고 다른 플레이어를 기다립니다.</p>
        </div>

        {/* 2번째 카드: 방 참여하기 */}
        <div
          onClick={handleGoToRoomChoice}
          style={{
            border: '2px solid #ccc',
            borderRadius: '16px',
            padding: '20px',
            cursor: 'pointer',
          }}
        >
          <h3>🎮 방 참여하기</h3>
          <p>생성된 게임 방 목록을 확인하고 원하는 방에 참여합니다.</p>
        </div>

        {/* 3번째 카드: ID로 검색 */}
        <div
          onClick={() => setModalStage('ID_INPUT')}
          style={{
            border: '2px solid #ccc',
            borderRadius: '16px',
            padding: '20px',
            cursor: 'pointer',
          }}
        >
          <h3>🔍 ID로 검색</h3>
          <p>방 ID를 직접 입력하여 비공개 방이나 특정 방을 찾습니다.</p>
        </div>

      </div>

      {/* ------------------- 1단계 팝업: ID 입력 ------------------- */}
      {modalStage === 'ID_INPUT' && (
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
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              minWidth: '300px',
              color: 'black',
            }}
          >
            <h3>방 ID 입력</h3>
            <input
              type="text"
              placeholder="방 ID를 입력하세요"
              value={searchRoomId}
              onChange={(e) => setSearchRoomId(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={handleCloseModal}>취소</button>
              <button onClick={handleNextStep}>다음</button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------- 2단계 팝업: 비밀번호 입력 ------------------- */}
      {modalStage === 'PASSWORD_INPUT' && (
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
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              minWidth: '300px',
              color: 'black',
            }}
          >
            <h3>🔒 비밀번호 입력</h3>
            <p style={{ fontSize: '14px', color: '#666' }}>비밀번호가 설정된 방입니다.</p>
            <input
              type="password"
              placeholder="비밀번호 입력"
              value={roomPassword}
              onChange={(e) => setRoomPassword(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={handleCloseModal}>취소</button>
              <button onClick={handleFinalJoin}>입장하기</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}