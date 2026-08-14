import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import Menu1Page from './pages/Menu1Page';
import Menu2Page from './pages/Menu2Page';
import Menu3Page from './pages/Menu3Page';

export default function App() {
  return (
    <BrowserRouter>
      <div>
        <Navbar />

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu1" element={<Menu1Page />} />
            <Route path="/menu2" element={<Menu2Page />} />
            <Route path="/menu3" element={<Menu3Page />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
