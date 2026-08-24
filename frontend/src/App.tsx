import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import TitleUnlockModal from './components/TitleUnlockModal';
import HomePage from './pages/HomePage';
import Menu1Page from './pages/Menu1Page';
import Menu2Page from './pages/Menu2Page';
import Menu3Page from './pages/Menu3Page';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import TitlesPage from './pages/TitlesPage';
import ProfilePage from './pages/ProfilePage';
import DrawingPage from './pages/DrawingPage';

export default function App() {
  const [unlockedTitle, setUnlockedTitle] = useState<string | null>(null);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <Navbar />
        <TitleUnlockModal title={unlockedTitle} onClose={() => setUnlockedTitle(null)} />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage onTitleUnlocked={setUnlockedTitle} />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/titles" element={<TitlesPage />} />
            <Route path="/lobby" element={<Menu1Page />} />
            <Route path="/social" element={<Menu2Page />} />
            <Route path="/ranking" element={<Menu3Page />} />
            <Route path="/drawing" element={<DrawingPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
