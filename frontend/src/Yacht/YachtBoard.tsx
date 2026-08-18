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

            // 턴이 바뀌었을 때 (내 턴이 돌아오거나 상대 턴으로 교대 시)
            if (prevTurnRef.current !== data.currentTurnIndex) {
              prevTurnRef.current = data.currentTurnIndex;
              setHeld([false, false, false, false, false]);
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

  if (loading || !game) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>게임 데이터를 불러오는 중...</div>;
  }

  const currentPlayer = game.players[game.currentTurnIndex];
  const cleanPlayerNick = currentPlayer?.nickname.replace(/ \(방장\)$/, '') || '';
  const isMyTurn = !game.isFinished && cleanPlayerNick === myNickname;

  // 굴리기가 1회 이상 진행된 경우(rollsLeft < 3)에만 KEEP 지정 허용
  const canToggleKeep = isMyTurn && game.rollsLeft > 0 && game.rollsLeft < 3;

  const handleToggleHold = (index: number) => {
    if (!canToggleKeep) return;
    setHeld((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const handleRollDice = async () => {
    if (!isMyTurn || game.rollsLeft <= 0 || isRolling) return;

    setIsRolling(true);
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
      } else {
        const err = await res.json();
        alert(err.message || '주사위를 굴릴 수 없습니다.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      // 3.5초 안전 폴백 타이머 (실제로는 3D 물리 정지 이벤트 onRollComplete로 약 1.5~2초만에 해제됨)
      setTimeout(() => {
        setIsRolling(false);
      }, 3500);
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
    <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      {/* 상단 헤더 및 나가기 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>🎲 Yacht Dice</h2>
        <button
          onClick={onLeave}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          방 나가기
        </button>
      </div>

      {game.isFinished && (
        <div
          style={{
            padding: '15px',
            backgroundColor: '#d4edda',
            color: '#155724',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          <h3>🏆 게임 종료! 승자: {game.winner}</h3>
        </div>
      )}

      {/* 2컬럼 레이아웃: 왼쪽 (족보 점수판), 오른쪽 (주사위 및 턴 정보) */}
      <div style={{ display: 'flex', gap: '25px', alignItems: 'flex-start' }}>
        {/* ================= 📊 왼쪽: 족보 점수판 (Scoreboard) ================= */}
        <div style={{ flex: '1 1 60%', overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'center',
              backgroundColor: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#343a40', color: '#fff' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>족보 (Categories)</th>
                {game.players.map((p, idx) => {
                  const isTurn = game.currentTurnIndex === idx;
                  return (
                    <th
                      key={p.slotNum}
                      style={{
                        padding: '12px',
                        backgroundColor: isTurn ? '#0056b3' : '#343a40',
                        minWidth: '95px',
                      }}
                    >
                      {p.nickname} {isTurn && '🎲'}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, i) => {
                const isFirstLower = i === 6;
                return (
                  <React.Fragment key={cat}>
                    {isFirstLower && (
                      <>
                        <tr style={{ backgroundColor: '#e9ecef', fontWeight: 'bold' }}>
                          <td style={{ padding: '8px 12px', textAlign: 'left' }}>Subtotal (상단 합계)</td>
                          {game.players.map((p) => {
                            const { subtotal } = calculateTotalScore(p.scores);
                            return (
                              <td key={p.slotNum} style={{ padding: '8px' }}>
                                {subtotal} / 63
                              </td>
                            );
                          })}
                        </tr>
                        <tr style={{ backgroundColor: '#e9ecef', fontWeight: 'bold' }}>
                          <td style={{ padding: '8px 12px', textAlign: 'left' }}>Bonus (+35점)</td>
                          {game.players.map((p) => {
                            const { bonus } = calculateTotalScore(p.scores);
                            return (
                              <td
                                key={p.slotNum}
                                style={{ padding: '8px', color: bonus > 0 ? '#28a745' : '#888' }}
                              >
                                +{bonus}
                              </td>
                            );
                          })}
                        </tr>
                      </>
                    )}

                    <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '500' }}>
                        {CATEGORY_LABELS[cat]}
                      </td>

                      {game.players.map((p, idx) => {
                        const isTurn = game.currentTurnIndex === idx;
                        const hasRecorded = p.scores[cat] !== undefined && p.scores[cat] !== null;
                        const recordedScore = p.scores[cat];
                        const previewScore = calculateScore(cat, game.dice);

                        if (hasRecorded) {
                          return (
                            <td key={p.slotNum} style={{ padding: '8px', fontWeight: 'bold' }}>
                              {recordedScore}
                            </td>
                          );
                        }

                        if (isTurn && isMyTurn) {
                          return (
                            <td key={p.slotNum} style={{ padding: '4px' }}>
                              <button
                                onClick={() => handleSelectScore(cat)}
                                style={{
                                  width: '100%',
                                  padding: '5px',
                                  backgroundColor: '#e8f4fe',
                                  color: '#007bff',
                                  border: '1px dashed #007bff',
                                  borderRadius: '4px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                }}
                              >
                                + {previewScore}점
                              </button>
                            </td>
                          );
                        }

                        return (
                          <td key={p.slotNum} style={{ padding: '8px', color: '#ccc' }}>
                            -
                          </td>
                        );
                      })}
                    </tr>
                  </React.Fragment>
                );
              })}

              <tr style={{ backgroundColor: '#212529', color: '#fff', fontWeight: 'bold', fontSize: '15px' }}>
                <td style={{ padding: '12px', textAlign: 'left' }}>Total Score (최종 총점)</td>
                {game.players.map((p) => {
                  const { total } = calculateTotalScore(p.scores);
                  return (
                    <td key={p.slotNum} style={{ padding: '12px', color: '#ffc107' }}>
                      {total}점
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* ================= 🎲 오른쪽: 주사위 & 게임 진행 패널 ================= */}
        <div style={{ flex: '1 1 40%', minWidth: '320px', position: 'sticky', top: '20px' }}>
          {/* 상태 패널 */}
          <div
            style={{
              backgroundColor: '#f8f9fa',
              padding: '15px 20px',
              borderRadius: '10px',
              marginBottom: '15px',
              border: '1px solid #e9ecef',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold', color: '#495057' }}>라운드:</span>
              <span style={{ fontWeight: 'bold', color: '#007bff' }}>{game.round} / 12</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#495057' }}>현재 턴:</span>
              <span
                style={{
                  fontWeight: 'bold',
                  padding: '4px 10px',
                  backgroundColor: isMyTurn ? '#fff3cd' : '#e9ecef',
                  color: isMyTurn ? '#856404' : '#495057',
                  borderRadius: '12px',
                  border: isMyTurn ? '1px solid #ffebaa' : 'none',
                }}
              >
                {currentPlayer?.nickname} {isMyTurn && ' (내 턴)'}
              </span>
            </div>
          </div>

          {/* 3D 주사위 패널 */}
          {!game.isFinished && (
            <div
              style={{
                backgroundColor: '#2b3e50',
                padding: '20px',
                borderRadius: '12px',
                color: '#fff',
                textAlign: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              }}
            >
			
              {/* 정돈된 2D KEEP 주사위 버튼 목록 */}
              <div
                style={{
                  display: 'flex',
                  justify: 'center',
                  alignItems: 'center',
                  gap: '15px',
                  margin: '15px 0 20px 0',
                }}
              >
                {game.dice.map((val, idx) => {
                  const isHeld = held[idx];
                  return (
                    <button
                      key={idx}
                      onClick={() => handleToggleHold(idx)}
                      disabled={!canToggleKeep}
                      style={{
                        width: '65px',
                        height: '65px',
                        backgroundColor: isHeld ? '#ffc107' : '#ffffff',
                        color: isHeld ? '#000' : '#333',
                        fontSize: '50px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '10px',
                        cursor: canToggleKeep ? 'pointer' : 'not-allowed',
                        boxShadow: isHeld
                          ? '0 0 8px #ffc107'
                          : '0 2px 5px rgba(0,0,0,0.15)',
                        border: isHeld ? '2px solid #d39e00' : '2px solid #e0e0e0',
                        opacity: canToggleKeep ? 1 : 0.7,
                        transform: isHeld ? 'scale(1.05)' : 'scale(1)',
                        transition: 'all 0.15s ease-in-out',
                        padding: 0,
                      }}
                    >
                      <span>{diceFaces[val - 1] || val}</span>
                      <span style={{ fontSize: '9px', fontWeight: 'bold', marginTop: '-2px' }}>
                        {isHeld ? 'KEEP' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
              {/* 3D Babylon.js Canvas */}
              <div style={{ marginBottom: '15px' }}>
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


              {/* 굴리기 버튼 */}
              <button
                onClick={handleRollDice}
                disabled={!isMyTurn || game.rollsLeft <= 0 || isRolling}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  backgroundColor: !isMyTurn || game.rollsLeft <= 0 || isRolling ? '#6c757d' : '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: !isMyTurn || game.rollsLeft <= 0 || isRolling ? 'not-allowed' : 'pointer',
                  boxShadow: !isMyTurn || game.rollsLeft <= 0 || isRolling ? 'none' : '0 4px 6px rgba(40,167,69,0.3)',
                }}
              >
                {isRolling ? '🎲 주사위 굴러가는 중...' : `🎲 주사위 굴리기 (남은 횟수: ${game.rollsLeft}번)`}
              </button>

              <p style={{ fontSize: '12px', color: '#adb5bd', marginTop: '12px', marginBottom: 0 }}>
                {!isMyTurn
                  ? '차례를 기다리는 중입니다.'
                  : game.rollsLeft === 3
                  ? '🎲 주사위를 먼저 굴린 후 Keep할 주사위를 선택하세요.'
                  : '3D 주사위나 아래 버튼을 클릭하여 보관(KEEP)할 주사위를 선택하고 다시 굴리세요.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
