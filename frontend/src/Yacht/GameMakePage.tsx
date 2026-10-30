import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export type SlotType = 'NONE' | 'HUMAN' | 'AI';
export type AiLevel = 'NOVICE' | 'INTERMEDIATE' | 'MASTER';

export default function GameMakePage() {
  const navigate = useNavigate();

  const [roomTitle, setRoomTitle] = useState('');
  const [playType, setPlayType] = useState<'SINGLE' | 'MULTI'>('MULTI');

  const [slot2, setSlot2] = useState<SlotType>('HUMAN');
  const [slot3, setSlot3] = useState<SlotType>('NONE');
  const [slot4, setSlot4] = useState<SlotType>('NONE');

  // 🤖 AI 슬롯별 난이도 상태 ('NOVICE': 초급 | 'INTERMEDIATE': 중급 | 'MASTER': 고급)
  const [slot2AiLevel, setSlot2AiLevel] = useState<AiLevel>('NOVICE');
  const [slot3AiLevel, setSlot3AiLevel] = useState<AiLevel>('NOVICE');
  const [slot4AiLevel, setSlot4AiLevel] = useState<AiLevel>('NOVICE');

  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [usePassword, setUsePassword] = useState<boolean>(false);
  const [password, setPassword] = useState('');

  const handlePlayTypeChange = (type: 'SINGLE' | 'MULTI') => {
    setPlayType(type);
    if (type === 'SINGLE') {
      setIsPublic(false);
      setUsePassword(false);
      setPassword('');

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

    if (slot2 === 'NONE' && slot3 === 'NONE' && slot4 === 'NONE') {
      alert('2명 이상이어야 합니다.');
      return;
    }

    try {
      const savedUser = sessionStorage.getItem('currentUser') || localStorage.getItem('user');
      const currentUser = savedUser ? JSON.parse(savedUser) : { nickname: '게스트', id: 'guest' };

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
          aiLevels: {
            p2: slot2AiLevel,
            p3: slot3AiLevel,
            p4: slot4AiLevel,
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
    <div className="max-w-2xl mx-auto my-8 p-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-6 pb-3 border-b border-gray-300 dark:border-gray-700">
        방 만들기
      </h2>

      <form onSubmit={handleCreateRoom} className="space-y-6">
        {/* 1. 방 이름 */}
        <section className="border border-gray-300 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
          <h3 className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-2">
            1. 방 이름
          </h3>
          <input
            type="text"
            placeholder="방 이름을 입력하세요"
            value={roomTitle}
            onChange={(e) => setRoomTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none"
          />
        </section>

        {/* 2. 플레이 설정 */}
        <section className="border border-gray-300 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
          <h3 className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-2">
            2. 모드 설정
          </h3>
          <div className="flex gap-6 text-sm">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="radio"
                name="playType"
                checked={playType === 'SINGLE'}
                onChange={() => handlePlayTypeChange('SINGLE')}
              />
              <span>개인전 (AI 대전)</span>
            </label>
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="radio"
                name="playType"
                checked={playType === 'MULTI'}
                onChange={() => handlePlayTypeChange('MULTI')}
              />
              <span>멀티플레이</span>
            </label>
          </div>
        </section>

        {/* 3. Player 설정 */}
        <section className="border border-gray-300 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300">
              3. 플레이어 설정 (슬롯)
            </h3>
            <div className="flex gap-1 text-xs">
              {playType === 'MULTI' ? (
                <>
                  <button
                    type="button"
                    onClick={() => { setSlot2('HUMAN'); setSlot3('NONE'); setSlot4('NONE'); }}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100"
                  >
                    2인
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSlot2('HUMAN'); setSlot3('HUMAN'); setSlot4('NONE'); }}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100"
                  >
                    3인
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSlot2('HUMAN'); setSlot3('HUMAN'); setSlot4('HUMAN'); }}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100"
                  >
                    4인
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => { setSlot2('AI'); setSlot3('NONE'); setSlot4('NONE'); }}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100"
                  >
                    VS AI 1
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSlot2('AI'); setSlot3('AI'); setSlot4('NONE'); }}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100"
                  >
                    VS AI 2
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSlot2('AI'); setSlot3('AI'); setSlot4('AI'); }}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100"
                  >
                    VS AI 3
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {/* Slot 1 (Host 고정) */}
            <div className="border border-gray-300 dark:border-gray-700 p-3 bg-gray-100 dark:bg-gray-800/80">
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Slot 1 (Host)</p>
              <select disabled className="w-full p-1.5 border border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
                <option>방장 (고정)</option>
              </select>
            </div>

            {/* Slot 2 */}
            <div className="border border-gray-300 dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Slot 2 (P2)</p>
              <select
                value={slot2}
                onChange={(e) => setSlot2(e.target.value as SlotType)}
                className="w-full p-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs outline-none"
              >
                {playType === 'MULTI' && <option value="HUMAN">참여 허용</option>}
                <option value="NONE">참여하지 않음</option>
                <option value="AI">AI</option>
              </select>

              {/* 🤖 Slot 2 AI 선택 시 가로 라디오 버튼 난이도 선택 */}
              {slot2 === 'AI' && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-500 text-[11px]">난이도:</span>
                  <div className="flex gap-2">
                    <label className="cursor-pointer flex items-center gap-1 text-[11px]">
                      <input
                        type="radio"
                        name="slot2AiLevel"
                        checked={slot2AiLevel === 'NOVICE'}
                        onChange={() => setSlot2AiLevel('NOVICE')}
                      />
                      <span>초급</span>
                    </label>
                    <label className="cursor-pointer flex items-center gap-1 text-[11px]">
                      <input
                        type="radio"
                        name="slot2AiLevel"
                        checked={slot2AiLevel === 'INTERMEDIATE'}
                        onChange={() => setSlot2AiLevel('INTERMEDIATE')}
                      />
                      <span>중급</span>
                    </label>
                    <label className="cursor-pointer flex items-center gap-1 text-[11px]">
                      <input
                        type="radio"
                        name="slot2AiLevel"
                        checked={slot2AiLevel === 'MASTER'}
                        onChange={() => setSlot2AiLevel('MASTER')}
                      />
                      <span>고급</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Slot 3 */}
            <div className="border border-gray-300 dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Slot 3 (P3)</p>
              <select
                value={slot3}
                onChange={(e) => setSlot3(e.target.value as SlotType)}
                className="w-full p-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs outline-none"
              >
                {playType === 'MULTI' && <option value="HUMAN">참여 허용</option>}
                <option value="NONE">참여하지 않음</option>
                <option value="AI">AI</option>
              </select>

              {/* 🤖 Slot 3 AI 선택 시 가로 라디오 버튼 난이도 선택 */}
              {slot3 === 'AI' && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-500 text-[11px]">난이도:</span>
                  <div className="flex gap-2">
                    <label className="cursor-pointer flex items-center gap-1 text-[11px]">
                      <input
                        type="radio"
                        name="slot3AiLevel"
                        checked={slot3AiLevel === 'NOVICE'}
                        onChange={() => setSlot3AiLevel('NOVICE')}
                      />
                      <span>초급</span>
                    </label>
                    <label className="cursor-pointer flex items-center gap-1 text-[11px]">
                      <input
                        type="radio"
                        name="slot3AiLevel"
                        checked={slot3AiLevel === 'INTERMEDIATE'}
                        onChange={() => setSlot3AiLevel('INTERMEDIATE')}
                      />
                      <span>중급</span>
                    </label>
                    <label className="cursor-pointer flex items-center gap-1 text-[11px]">
                      <input
                        type="radio"
                        name="slot3AiLevel"
                        checked={slot3AiLevel === 'MASTER'}
                        onChange={() => setSlot3AiLevel('MASTER')}
                      />
                      <span>고급</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Slot 4 */}
            <div className="border border-gray-300 dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Slot 4 (P4)</p>
              <select
                value={slot4}
                onChange={(e) => setSlot4(e.target.value as SlotType)}
                className="w-full p-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs outline-none"
              >
                {playType === 'MULTI' && <option value="HUMAN">참여 허용</option>}
                <option value="NONE">참여하지 않음</option>
                <option value="AI">AI</option>
              </select>

              {/* 🤖 Slot 4 AI 선택 시 가로 라디오 버튼 난이도 선택 */}
              {slot4 === 'AI' && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-500 text-[11px]">난이도:</span>
                  <div className="flex gap-2">
                    <label className="cursor-pointer flex items-center gap-1 text-[11px]">
                      <input
                        type="radio"
                        name="slot4AiLevel"
                        checked={slot4AiLevel === 'NOVICE'}
                        onChange={() => setSlot4AiLevel('NOVICE')}
                      />
                      <span>초급</span>
                    </label>
                    <label className="cursor-pointer flex items-center gap-1 text-[11px]">
                      <input
                        type="radio"
                        name="slot4AiLevel"
                        checked={slot4AiLevel === 'INTERMEDIATE'}
                        onChange={() => setSlot4AiLevel('INTERMEDIATE')}
                      />
                      <span>중급</span>
                    </label>
                    <label className="cursor-pointer flex items-center gap-1 text-[11px]">
                      <input
                        type="radio"
                        name="slot4AiLevel"
                        checked={slot4AiLevel === 'MASTER'}
                        onChange={() => setSlot4AiLevel('MASTER')}
                      />
                      <span>고급</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 4. 공개 및 비밀번호 */}
        <section className="border border-gray-300 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
          <h3 className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-2">
            4. 공개 및 비밀번호
          </h3>

          {playType === 'SINGLE' ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              개인전 모드는 비공개 / 비밀번호 미사용 상태로 고정됩니다.
            </p>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-6">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">공개:</span>
                <label className="cursor-pointer flex items-center gap-1.5 text-xs">
                  <input
                    type="radio"
                    name="isPublic"
                    checked={isPublic === true}
                    onChange={() => setIsPublic(true)}
                  />
                  <span>공개</span>
                </label>
                <label className="cursor-pointer flex items-center gap-1.5 text-xs">
                  <input
                    type="radio"
                    name="isPublic"
                    checked={isPublic === false}
                    onChange={() => setIsPublic(false)}
                  />
                  <span>비공개</span>
                </label>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">비밀번호:</span>
                <label className="cursor-pointer flex items-center gap-1.5 text-xs">
                  <input
                    type="radio"
                    name="usePassword"
                    checked={usePassword === false}
                    onChange={() => {
                      setUsePassword(false);
                      setPassword('');
                    }}
                  />
                  <span>미사용</span>
                </label>
                <label className="cursor-pointer flex items-center gap-1.5 text-xs">
                  <input
                    type="radio"
                    name="usePassword"
                    checked={usePassword === true}
                    onChange={() => setUsePassword(true)}
                  />
                  <span>사용</span>
                </label>
              </div>

              <input
                type="password"
                placeholder={usePassword ? '비밀번호를 입력하세요' : '비밀번호 미사용'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!usePassword}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 disabled:bg-gray-100 dark:disabled:bg-gray-700/50 text-gray-900 dark:text-white text-sm outline-none"
              />
            </div>
          )}
        </section>

        {/* 5. 버튼 */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/yacht')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-medium hover:bg-gray-100"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
          >
            방 생성
          </button>
        </div>
      </form>
    </div>
  );
}
