import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Menu1Page from './pages/Menu1Page';
import Menu2Page from './pages/Menu2Page';
import Menu3Page from './pages/Menu3Page';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/menu1" element={<Menu1Page />} />
            <Route path="/menu2" element={<Menu2Page />} />
            <Route path="/menu3" element={<Menu3Page />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
