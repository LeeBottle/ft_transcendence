import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import TitleUnlockModal from './components/TitleUnlockModal';

// 일반 및 인증 페이지
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import TitlesPage from './pages/TitlesPage';
import MatchHistoryPage from './pages/MatchHistoryPage';
import RankingPage from './pages/RankingPage';
import DrawingPage from './pages/DrawingPage';

// 요트 다이스 게임 페이지
import LobbyPage from './Yacht/LobbyPage';
import GameMakePage from './Yacht/GameMakePage';
import GameRoomPage from './Yacht/GameRoomPage';
import LobbyRoomChoice from './Yacht/LobbyRoomChoice';

export default function App() {
  const [unlockedTitle, setUnlockedTitle] = useState<string | null>(null);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100 dark:bg-gray-900 text-slate-900 dark:text-white transition-colors duration-200 flex flex-col">
        <Navbar />
        <TitleUnlockModal title={unlockedTitle} onClose={() => setUnlockedTitle(null)} />

        <main className="flex-1">
          <Routes>
            {/* 기본 및 인증 */}
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage onTitleUnlocked={setUnlockedTitle} />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/titles" element={<TitlesPage />} />
            <Route path="/matches" element={<MatchHistoryPage />} />
            <Route path="/ranking" element={<RankingPage />} />

            {/* 요트 다이스 게임 라우트 */}
            <Route path="/yacht" element={<LobbyPage />} />
            <Route path="/yacht/choice" element={<LobbyRoomChoice />} />
            <Route path="/yacht/make" element={<GameMakePage />} />
            <Route path="/yacht/room/:roomId" element={<GameRoomPage />} />
            <Route path="/lobby" element={<LobbyPage />} />
            <Route path="/menu1" element={<LobbyPage />} />

            {/* 부가 기능: 실시간 캔버스 */}
            <Route path="/drawing" element={<DrawingPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
