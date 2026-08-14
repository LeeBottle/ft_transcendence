import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export type SlotType = 'NONE' | 'HUMAN' | 'AI';

export default function GameMakePage() {
  const navigate = useNavigate();

  const [roomTitle, setRoomTitle] = useState('');
  const [playType, setPlayType] = useState<'SINGLE' | 'MULTI'>('MULTI');

  // Slot 2, Slot 3, Slot 4 상태 관리 (Slot 1은 방장 고정)
  const [slot2, setSlot2] = useState<SlotType>('HUMAN');
  const [slot3, setSlot3] = useState<SlotType>('NONE');
  const [slot4, setSlot4] = useState<SlotType>('NONE');

  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [usePassword, setUsePassword] = useState<boolean>(false);
  const [password, setPassword] = useState('');

  // 플레이 설정 전환 핸들러 (개인전 vs 멀티플레이)
  const handlePlayTypeChange = (type: 'SINGLE' | 'MULTI') => {
    setPlayType(type);
    if (type === 'SINGLE') {
      // 개인전 설정 시 자동 고정: 비공개 / 비밀번호 미사용
      setIsPublic(false);
      setUsePassword(false);
      setPassword('');

      // 개인전에서는 HUMAN 선택 불가 -> 기존 HUMAN이었던 슬롯을 AI 또는 NONE으로 자동 조정
      if (slot2 === 'HUMAN') setSlot2('AI');
      if (slot3 === 'HUMAN') setSlot3('NONE');
      if (slot4 === 'HUMAN') setSlot4('NONE');
    } else {
      setIsPublic(true);
      if (slot2 === 'NONE' && slot3 === 'NONE' && slot4 === 'NONE') {
        setSlot2('HUMAN');
      }
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomTitle.trim()) {
      alert('방 이름을 입력해 주세요.');
      return;
    }

    // 1. 모두 '참여하지 않음' 상태인 경우 체크 (2명 이상 검증)
    if (slot2 === 'NONE' && slot3 === 'NONE' && slot4 === 'NONE') {
      alert('2명 이상이어야 합니다');
      return;
    }

    try {
      const savedUser = sessionStorage.getItem('currentUser');
      const currentUser = savedUser ? JSON.parse(savedUser) : { nickname: 'a' };

      const response = await fetch('/api/yacht/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: roomTitle,
          hostNickname: currentUser.nickname,
          password: playType === 'SINGLE' ? null : (usePassword ? password : null),
          isPublic: playType === 'SINGLE' ? false : isPublic,
          slots: {
            p2: slot2,
            p3: slot3,
            p4: slot4,
          },
        }),
      });

      if (!response.ok) throw new Error('방 생성 실패');

      const createdRoom = await response.json();
      navigate(`/yacht/room/${createdRoom.id}`);
    } catch (error) {
      console.error(error);
      alert('방 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>🛠️ 방 만들기</h2>

      <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 1. 방 이름 */}
        <section style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>1. 방 이름</h3>
          <input
            type="text"
            placeholder="방 이름을 입력하세요"
            value={roomTitle}
            onChange={(e) => setRoomTitle(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </section>

        {/* 2. 플레이 설정 */}
        <section style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>2. 플레이 설정</h3>
          <label style={{ marginRight: '20px', cursor: 'pointer' }}>
            <input
              type="radio"
              name="playType"
              checked={playType === 'SINGLE'}
              onChange={() => handlePlayTypeChange('SINGLE')}
            />
            개인전 (AI 대전)
          </label>
          <label style={{ cursor: 'pointer' }}>
            <input
              type="radio"
              name="playType"
              checked={playType === 'MULTI'}
              onChange={() => handlePlayTypeChange('MULTI')}
            />
            멀티플레이
          </label>
        </section>

        {/* 3. Player 설정 (2~4인) */}
        <section style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0 }}>3. Player 인원 설정</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {playType === 'MULTI' ? (
                <>
                  <button
                    type="button"
                    onClick={() => { setSlot2('HUMAN'); setSlot3('NONE'); setSlot4('NONE'); }}
                    style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    2인전 (P1+P2)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSlot2('HUMAN'); setSlot3('HUMAN'); setSlot4('NONE'); }}
                    style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    3인전 (P1+P2+P3)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSlot2('HUMAN'); setSlot3('HUMAN'); setSlot4('HUMAN'); }}
                    style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    4인전 (P1+P2+P3+P4)
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => { setSlot2('AI'); setSlot3('NONE'); setSlot4('NONE'); }}
                    style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    VS AI 1명
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSlot2('AI'); setSlot3('AI'); setSlot4('NONE'); }}
                    style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    VS AI 2명
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSlot2('AI'); setSlot3('AI'); setSlot4('AI'); }}
                    style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    VS AI 3명
                  </button>
                </>
              )}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* Slot 1 (방장 고정) */}
            <div style={{ border: '1px solid #aaa', padding: '10px', borderRadius: '6px', backgroundColor: '#f5f5f5' }}>
              <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Slot 1 (P1 - Host)</p>
              <select disabled style={{ width: '100%', padding: '5px' }}>
                <option>본인 (Host)</option>
              </select>
            </div>

            {/* Slot 2 */}
            <div style={{ border: '1px solid #aaa', padding: '10px', borderRadius: '6px' }}>
              <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Slot 2 (P2)</p>
              <select
                value={slot2}
                onChange={(e) => setSlot2(e.target.value as SlotType)}
                style={{ width: '100%', padding: '5px' }}
              >
                {playType === 'MULTI' && <option value="HUMAN">참여 허용</option>}
                <option value="AI">AI</option>
                <option value="NONE">참여하지 않음</option>
              </select>
            </div>

            {/* Slot 3 */}
            <div style={{ border: '1px solid #aaa', padding: '10px', borderRadius: '6px' }}>
              <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Slot 3 (P3)</p>
              <select
                value={slot3}
                onChange={(e) => setSlot3(e.target.value as SlotType)}
                style={{ width: '100%', padding: '5px' }}
              >
                {playType === 'MULTI' && <option value="HUMAN">참여 허용</option>}
                <option value="NONE">참여하지 않음</option>
                <option value="AI">AI</option>
              </select>
            </div>

            {/* Slot 4 */}
            <div style={{ border: '1px solid #aaa', padding: '10px', borderRadius: '6px' }}>
              <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Slot 4 (P4)</p>
              <select
                value={slot4}
                onChange={(e) => setSlot4(e.target.value as SlotType)}
                style={{ width: '100%', padding: '5px' }}
              >
                {playType === 'MULTI' && <option value="HUMAN">참여 허용</option>}
                <option value="NONE">참여하지 않음</option>
                <option value="AI">AI</option>
              </select>
            </div>
          </div>
        </section>

        {/* 4. 방 설정 */}
        <section style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h3>4. 방 설정</h3>

          {playType === 'SINGLE' ? (
            <p style={{ color: '#666', fontStyle: 'italic', margin: '5px 0' }}>
              🔒 개인전 모드는 자동으로 <strong>비공개 / 비밀번호 미사용</strong> 상태로 고정됩니다.
            </p>
          ) : (
            <>
              <div style={{ marginBottom: '15px' }}>
                <span style={{ fontWeight: 'bold', marginRight: '10px' }}>공개 여부:</span>
                <label style={{ marginRight: '15px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="isPublic"
                    checked={isPublic === true}
                    onChange={() => setIsPublic(true)}
                  />{' '}
                  공개
                </label>
                <label style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="isPublic"
                    checked={isPublic === false}
                    onChange={() => setIsPublic(false)}
                  />{' '}
                  비공개
                </label>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold', marginRight: '10px' }}>비밀번호 사용:</span>
                <label style={{ marginRight: '15px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="usePassword"
                    checked={usePassword === false}
                    onChange={() => {
                      setUsePassword(false);
                      setPassword('');
                    }}
                  />{' '}
                  미사용
                </label>
                <label style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="usePassword"
                    checked={usePassword === true}
                    onChange={() => setUsePassword(true)}
                  />{' '}
                  사용
                </label>
              </div>

              <input
                type="password"
                placeholder={usePassword ? '비밀번호를 입력하세요' : '비밀번호 미사용'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!usePassword}
                style={{
                  width: '100%',
                  padding: '8px',
                  boxSizing: 'border-box',
                  backgroundColor: usePassword ? '#fff' : '#eee',
                }}
              />
            </>
          )}
        </section>

        {/* 5. 버튼 */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate('/menu1')} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            취소
          </button>
          <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold' }}>
            방 생성
          </button>
        </div>
      </form>
    </div>
  );
}
