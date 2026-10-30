import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LobbyPage() {
  const navigate = useNavigate();

  const [modalStage, setModalStage] = useState<'NONE' | 'ID_INPUT' | 'PASSWORD_INPUT'>('NONE');
  const [searchRoomId, setSearchRoomId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');

  const handleGoToMakePage = () => {
    navigate('/yacht/make');
  };

  const handleGoToRoomChoice = () => {
    navigate('/yacht/choice');
  };

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
        navigate(`/yacht/room/${room.id}`);
      }
    } catch (err) {
      console.error(err);
      alert('방 정보를 조회하는 중 오류가 발생했습니다.');
    }
  };

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
      navigate(`/yacht/room/${room.id}`);
    } catch (err) {
      console.error(err);
      alert('입장 처리 중 오류가 발생했습니다.');
    }
  };

  const handleCloseModal = () => {
    setModalStage('NONE');
    setSearchRoomId('');
    setRoomPassword('');
  };

  return (
    <div className="max-w-3xl mx-auto my-8 px-4">
      <div className="mb-6 pb-3 border-b border-gray-300 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          요트 다이스 로비
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          게임을 시작할 방식을 선택하세요.
        </p>
      </div>

      <div className="grid gap-4">
        {/* 1. 방 만들기 */}
        <div
          onClick={handleGoToMakePage}
          className="p-5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
        >
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            방 만들기
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            인원수, AI 설정, 비공개 여부를 지정하여 새로운 방을 개설합니다.
          </p>
        </div>

        {/* 2. 방 참여하기 */}
        <div
          onClick={handleGoToRoomChoice}
          className="p-5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
        >
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            방 목록 참여
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            현재 개설된 공개 방 목록을 확인하고 원하는 방에 입장합니다.
          </p>
        </div>

        {/* 3. ID로 검색 */}
        <div
          onClick={() => setModalStage('ID_INPUT')}
          className="p-5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
        >
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            방 ID 검색
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            방 고유 ID를 입력하여 특정 방에 바로 입장합니다.
          </p>
        </div>
      </div>

      {/* 팝업 모달: ID 입력 */}
      {modalStage === 'ID_INPUT' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6 max-w-sm w-full">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
              방 ID 입력
            </h3>
            <input
              type="text"
              placeholder="방 ID를 입력하세요"
              value={searchRoomId}
              onChange={(e) => setSearchRoomId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNextStep();
              }}
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none mb-4"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={handleCloseModal}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-100"
              >
                취소
              </button>
              <button
                onClick={handleNextStep}
                className="px-4 py-1.5 bg-blue-600 text-white font-bold hover:bg-blue-700"
              >
                다음
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 팝업 모달: 비밀번호 입력 */}
      {modalStage === 'PASSWORD_INPUT' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6 max-w-sm w-full">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
              비밀번호 입력
            </h3>
            <input
              type="password"
              placeholder="비밀번호"
              value={roomPassword}
              onChange={(e) => setRoomPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFinalJoin();
              }}
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none mb-4"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={handleCloseModal}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-100"
              >
                취소
              </button>
              <button
                onClick={handleFinalJoin}
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
