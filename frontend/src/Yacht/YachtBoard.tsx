import React, { useState, useEffect, useRef } from 'react';
import {
  CategoryKey,
  CATEGORY_LABELS,
  ScoreSheet,
  calculateScore,
  calculateTotalScore,
} from './yachtScore';
import Dice3DCanvas from './Dice3DCanvas';

interface PlayerGameState {
  slotNum: number;
  nickname: string;
  isAi: boolean;
  scores: ScoreSheet;
}

interface GameState {
  roomId: string;
  round: number;
  currentTurnIndex: number;
  players: PlayerGameState[];
  dice: number[];
  held: boolean[];
  rollsLeft: number;
  isFinished: boolean;
  winner: string | null;
}

interface YachtBoardProps {
  roomId: string;
  myNickname: string;
  onLeave: () => void;
}

export default function YachtBoard({ roomId, myNickname, onLeave }: YachtBoardProps) {
  const [game, setGame] = useState<GameState | null>(null);
  const [held, setHeld] = useState<boolean[]>([false, false, false, false, false]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRolling, setIsRolling] = useState<boolean>(false);

  const prevTurnRef = useRef<number | null>(null);
  const prevDiceRef = useRef<string>('');
  const hasAlertedRef = useRef<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const fetchGame = async () => {
      try {
        const res = await fetch(`/api/yacht/rooms/${roomId}/game`);
        if (res.ok) {
          const data: GameState = await res.json();
          if (isMounted) {
            // 주사위 값이 이전과 달라진 경우 (상대방/AI 턴 포함) 3D 굴림 애니메이션 감지
            // (단, 턴 시작 직후 rollsLeft === 3일 때는 굴리지 않고 1열 정렬 대기)
            const newDiceStr = JSON.stringify(data.dice);
            if (prevDiceRef.current && prevDiceRef.current !== newDiceStr && data.rollsLeft < 3) {
              setIsRolling(true);
              // 안전을 위한 긴 폴백 타이머 (기본은 3D physics 굴림 완료 감지로 해제됨)
              setTimeout(() => setIsRolling(false), 3500);
            }
            prevDiceRef.current = newDiceStr;

            setGame(data);
            setLoading(false);

            // 🎯 상대방이 모두 퇴장하여 마지막 1명이 남은 경우 경고 알림 및 부전승 처리
            if (data.isFinished && (data as any).endReason === 'OPPONENT_LEFT' && !hasAlertedRef.current) {
              hasAlertedRef.current = true;
              alert('⚠️ 상대방이 퇴장하여 더 이상 게임을 진행할 수 없습니다.\n회원님의 부전승(자동 승리)으로 처리되었습니다!');
            }

            // 🎯 상대방 턴일 때 서버의 실시간 KEEP 상태 동기화
            const isTurnOwner = !data.isFinished && data.players[data.currentTurnIndex]?.nickname.replace(/ \(방장\)$/, '') === myNickname;
            if (!isTurnOwner && data.held) {
              setHeld(data.held);
            }

            // 턴이 바뀌었을 때 (내 턴이 돌아오거나 상대 턴으로 교대 시)
            if (prevTurnRef.current !== data.currentTurnIndex) {
              prevTurnRef.current = data.currentTurnIndex;
              setHeld(data.held || [false, false, false, false, false]);
              setIsRolling(false); // 턴 교대 시 굴림 상태 해제하여 1열 정렬 적용
            }
          }
        }
      } catch (err) {
        console.error('Game fetch error:', err);
      }
    };

    fetchGame();
    const interval = setInterval(fetchGame, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [roomId]);

  // 게임 진행 중 나가기 클릭 시 기권(패배) 경고 확인
  const handleLeaveGameClick = () => {
    if (!game?.isFinished) {
      const ok = window.confirm(
        '⚠️ 게임 진행 중에 퇴장하시면 자동으로 기권(패배) 처리됩니다.\n정말 방에서 나가시겠습니까?'
      );
      if (!ok) return;
    }
    onLeave();
  };

  if (loading || !game) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>게임 데이터를 불러오는 중...</div>;
  }

  const currentPlayer = game.players[game.currentTurnIndex];
  const cleanPlayerNick = currentPlayer?.nickname.replace(/ \(방장\)$/, '') || '';
  const isMyTurn = !game.isFinished && cleanPlayerNick === myNickname;

  // 굴리기가 1회 이상 진행된 경우(rollsLeft < 3)에만 KEEP 지정 허용
  const canToggleKeep = isMyTurn && game.rollsLeft > 0 && game.rollsLeft < 3;

  const handleToggleHold = async (index: number) => {
    if (!canToggleKeep) return;
    const nextHeld = [...held];
    nextHeld[index] = !nextHeld[index];
    setHeld(nextHeld);

    // 🎯 실시간 KEEP 상태 서버 동기화 전송 (상대방 화면에도 즉시 반영!)
    try {
      await fetch(`/api/yacht/rooms/${roomId}/game/hold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: myNickname,
          held: nextHeld,
        }),
      });
    } catch (err) {
      console.error('Hold sync error:', err);
    }
  };

  const handleRollDice = async () => {
    if (!isMyTurn || game.rollsLeft <= 0 || isRolling) return;

    try {
      const res = await fetch(`/api/yacht/rooms/${roomId}/game/roll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: myNickname,
          held,
        }),
      });

      if (res.ok) {
        const updatedGame: GameState = await res.json();
        setGame(updatedGame);
        prevDiceRef.current = JSON.stringify(updatedGame.dice);
        // 🎯 새 주사위 결과값을 서버로부터 수신한 직후 3D 굴리기 트리거!
        setIsRolling(true);
      } else {
        const err = await res.json();
        alert(err.message || '주사위를 굴릴 수 없습니다.');
      }
    } catch (err) {
      console.error('Roll error:', err);
    }
  };

  const handleSelectScore = async (category: CategoryKey) => {
    if (!isMyTurn) return;

    try {
      const res = await fetch(`/api/yacht/rooms/${roomId}/game/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: myNickname,
          category,
        }),
      });

      if (res.ok) {
        const updatedGame: GameState = await res.json();
        setGame(updatedGame);
        setHeld([false, false, false, false, false]);
      } else {
        const err = await res.json();
        alert(err.message || '점수를 선택할 수 없습니다.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const categories: CategoryKey[] = [
    'ones',
    'twos',
    'threes',
    'fours',
    'fives',
    'sixes',
    'choice',
    'fourOfAKind',
    'fullHouse',
    'smallStraight',
    'largeStraight',
    'yacht',
  ];

  const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 text-gray-900 dark:text-white">
      {/* 상단 헤더 및 나가기 버튼 */}
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-300 dark:border-gray-700">
        <h2 className="text-xl font-bold">
          Yacht Dice 게임 진행
        </h2>
        <button
          onClick={handleLeaveGameClick}
          className="px-3 py-1.5 border border-red-300 dark:border-red-700 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 hover:bg-red-50 text-xs font-semibold"
        >
          방 나가기 (기권)
        </button>
      </div>

      {game.isFinished && (
        <div
          className={`p-5 mb-5 text-center border ${
            (game as any).endReason === 'OPPONENT_LEFT'
              ? 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-400 text-yellow-900 dark:text-yellow-200'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          <h3 className="text-base font-bold mb-1">
            {(game as any).endReason === 'OPPONENT_LEFT'
              ? '게임을 진행할 수 없습니다 (상대방 퇴장)'
              : '게임 종료'}
          </h3>
          <p className="text-xs font-semibold mb-3">
            승자: {game.winner}
          </p>
          <button
            onClick={onLeave}
            className="px-4 py-1.5 bg-blue-600 text-white font-bold text-xs hover:bg-blue-700"
          >
            로비로 나가기
          </button>
        </div>
      )}

      {/* 2컬럼 레이아웃: 왼쪽 (족보 점수판), 오른쪽 (주사위 및 턴 정보) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* ================= 📊 왼쪽: 족보 점수판 (Scoreboard) ================= */}
        <div className="w-full lg:w-3/5 overflow-x-auto">
          <table className="w-full border-collapse text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 text-xs">
            <thead>
              <tr className="bg-gray-800 text-white font-bold border-b border-gray-400">
                <th className="p-2.5 text-left">족보 (Categories)</th>
                {game.players.map((p, idx) => {
                  const isTurn = game.currentTurnIndex === idx;
                  return (
                    <th
                      key={p.slotNum}
                      className={`p-2.5 min-w-[85px] border-l border-gray-700 ${
                        isTurn ? 'bg-blue-700' : 'bg-gray-800'
                      }`}
                    >
                      {p.nickname} {isTurn && '[턴]'}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              {categories.map((cat, i) => {
                const isFirstLower = i === 6;
                return (
                  <React.Fragment key={cat}>
                    {isFirstLower && (
                      <>
                        <tr className="bg-gray-100 dark:bg-gray-700/60 font-bold border-t border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-xs">
                          <td className="py-2 px-3 text-left">Subtotal (상단 합계)</td>
                          {game.players.map((p) => {
                            const { subtotal } = calculateTotalScore(p.scores);
                            return (
                              <td key={p.slotNum} className="py-2 px-1 border-l border-gray-300 dark:border-gray-700">
                                {subtotal} / 63
                              </td>
                            );
                          })}
                        </tr>
                        <tr className="bg-gray-100 dark:bg-gray-700/60 font-bold border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-xs">
                          <td className="py-2 px-3 text-left">Bonus (+35점)</td>
                          {game.players.map((p) => {
                            const { bonus } = calculateTotalScore(p.scores);
                            return (
                              <td
                                key={p.slotNum}
                                className={`py-2 px-1 border-l border-gray-300 dark:border-gray-700 ${bonus > 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-gray-400'}`}
                              >
                                +{bonus}
                              </td>
                            );
                          })}
                        </tr>
                      </>
                    )}

                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-750 text-xs">
                      <td className="py-1.5 px-3 text-left font-medium text-gray-700 dark:text-gray-300">
                        {CATEGORY_LABELS[cat]}
                      </td>

                      {game.players.map((p, idx) => {
                        const isTurn = game.currentTurnIndex === idx;
                        const hasRecorded = p.scores[cat] !== undefined && p.scores[cat] !== null;
                        const recordedScore = p.scores[cat];
                        const previewScore = calculateScore(cat, game.dice);

                        if (hasRecorded) {
                          return (
                            <td key={p.slotNum} className="py-1.5 px-1 font-bold border-l border-gray-200 dark:border-gray-700">
                              {recordedScore}
                            </td>
                          );
                        }

                        if (isTurn && isMyTurn) {
                          return (
                            <td key={p.slotNum} className="py-1 px-1 border-l border-gray-200 dark:border-gray-700">
                              <button
                                onClick={() => handleSelectScore(cat)}
                                className="w-full py-1 px-1 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 border border-blue-400 font-bold text-xs hover:bg-blue-100"
                              >
                                +{previewScore}
                              </button>
                            </td>
                          );
                        }

                        return (
                          <td key={p.slotNum} className="py-1.5 px-1 text-gray-400 border-l border-gray-200 dark:border-gray-700">
                            -
                          </td>
                        );
                      })}
                    </tr>
                  </React.Fragment>
                );
              })}

              <tr className="bg-gray-900 text-white font-bold text-xs border-t-2 border-gray-400">
                <td className="p-2.5 text-left">Total Score (최종 총점)</td>
                {game.players.map((p) => {
                  const { total } = calculateTotalScore(p.scores);
                  return (
                    <td key={p.slotNum} className="p-2.5 text-yellow-400 font-bold border-l border-gray-700">
                      {total}점
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* ================= 오른쪽: 주사위 & 게임 진행 패널 ================= */}
        <div className="w-full lg:w-2/5 min-w-[300px] sticky top-4 space-y-3">
          {/* 상태 패널 (각진 박스) */}
          <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4 text-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-gray-500">라운드:</span>
              <span className="font-bold text-sm text-gray-900 dark:text-white">{game.round} / 12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-500">현재 턴:</span>
              <span className="font-bold border border-gray-300 dark:border-gray-600 px-2 py-0.5 bg-gray-50 dark:bg-gray-700">
                {currentPlayer?.nickname} {isMyTurn && '(내 턴)'}
              </span>
            </div>
          </div>

          {/* 주사위 패널 */}
          {!game.isFinished && (
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4 text-center">
              {/* 2D KEEP 버튼 (각진 사각 버튼) */}
              <div className="flex justify-center items-center gap-2 mb-4">
                {game.dice.map((val, idx) => {
                  const isHeld = held[idx];
                  const isMyHold = isMyTurn && isHeld;
                  const isOtherHold = !isMyTurn && isHeld;

                  let bgClass = 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white';
                  if (isMyHold) {
                    bgClass = 'bg-yellow-100 dark:bg-yellow-900/60 border-yellow-500 text-yellow-900 dark:text-yellow-200 font-bold';
                  } else if (isOtherHold) {
                    bgClass = 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-300 text-yellow-800 dark:text-yellow-300';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleToggleHold(idx)}
                      disabled={!canToggleKeep}
                      className={`w-14 h-16 border flex flex-col items-center justify-between p-1 text-xs ${bgClass} ${
                        canToggleKeep ? 'cursor-pointer hover:border-blue-500' : 'cursor-default'
                      }`}
                    >
                      <span className="text-[10px] font-bold">
                        {isHeld ? 'KEEP' : '-'}
                      </span>
                      <span className="text-3xl leading-none">
                        {diceFaces[val - 1] || val}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        #{idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 3D Canvas */}
              <div className="mb-4 border border-gray-300 dark:border-gray-700">
                <Dice3DCanvas
                  dice={game.dice}
                  held={held}
                  onToggleHold={handleToggleHold}
                  isMyTurn={isMyTurn}
                  rollsLeft={game.rollsLeft}
                  isRolling={isRolling}
                  onRollComplete={() => setIsRolling(false)}
                />
              </div>

              {/* 굴리기 버튼 (각진 사각형) */}
              <button
                onClick={handleRollDice}
                disabled={!isMyTurn || game.rollsLeft <= 0 || isRolling}
                className={`w-full py-2.5 px-4 text-xs font-bold border ${
                  !isMyTurn || game.rollsLeft <= 0 || isRolling
                    ? 'border-gray-300 bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'
                }`}
              >
                {isRolling ? '주사위 굴리는 중...' : `주사위 굴리기 (남은 횟수: ${game.rollsLeft}회)`}
              </button>

              <p className="text-[11px] text-gray-500 mt-2">
                {!isMyTurn
                  ? '상대방의 턴입니다.'
                  : game.rollsLeft === 3
                  ? '주사위를 먼저 굴려주세요.'
                  : 'KEEP할 주사위를 선택하고 다시 굴리세요.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
