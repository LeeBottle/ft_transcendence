import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Menu2Page from './pages/Menu2Page';
import Menu3Page from './pages/Menu3Page';

import LobbyPage from './Yacht/LobbyPage';
import GameMakePage from './Yacht/GameMakePage';
import GameRoomPage from './Yacht/GameRoomPage';
import LobbyRoomChoice from './Yacht/LobbyRoomChoice';

export default function App() {
  return (
    <BrowserRouter>
      <div>
        <Navbar />

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />

            {/* Menu 1 눌렀을 때 로비로 이동 */}
            <Route path="/menu1" element={<LobbyPage />} />
            
            {/* 방 만들기 전용 페이지 */}
            <Route path="/Yacht/make" element={<GameMakePage />} />
            
            {/* 방 리스트 선택 페이지 */}
            <Route path="/Yacht/choice" element={<LobbyRoomChoice />} />

            {/* 방 참여 및 게임 진행 전용 페이지 */}
            <Route path="/Yacht/room/:roomId" element={<GameRoomPage />} />

            <Route path="/menu2" element={<Menu2Page />} />
            <Route path="/menu3" element={<Menu3Page />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}