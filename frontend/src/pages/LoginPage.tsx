import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PuzzleCaptcha from '../components/PuzzleCaptcha';

interface LoginPageProps {
  onTitleUnlocked: (title: string) => void;
}

export default function LoginPage({ onTitleUnlocked }: LoginPageProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaStartTime, setCaptchaStartTime] = useState<number>(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsVerified(false);
    setCaptchaStartTime(Date.now());
    setShowCaptchaModal(true);
  };

  const executeLogin = async (isFastCaptcha: boolean = false) => {
    setShowCaptchaModal(false);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(Array.isArray(data.message) ? data.message.join(', ') : data.message || '로그인 실패');
      }

      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(new Event('auth-change'));

        // ⚡ 3초 이내 초고속 통과 시 '스피드 러너' 칭호 실시간 해금!
        if (isFastCaptcha) {
          fetch('/api/auth/claim-title', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${data.accessToken}`,
            },
            body: JSON.stringify({ title: '스피드 러너' }),
          })
            .then((r) => r.json())
            .then((claimData) => {
              if (claimData.user) {
                localStorage.setItem('user', JSON.stringify(claimData.user));
                window.dispatchEvent(new Event('auth-change'));
              }
            })
            .catch(() => {});
        }
      }

      const earnedTitle = data.user.title || '초급 슬라이더';

      navigate('/');
      if (data.isNewTitle) onTitleUnlocked(earnedTitle);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCaptchaVerified = () => {
    setIsVerified(true);
    const elapsed = Date.now() - captchaStartTime;
    executeLogin(elapsed < 3000);
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 relative">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white p-8 rounded-xl shadow-xl w-full max-w-md transition-colors duration-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">로그인</h2>

        {message && (
          <div
            className={`p-3 rounded mb-4 text-sm ${
              message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">이메일</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded font-semibold transition duration-200"
          >
            {isSubmitting ? '로그인 처리 중...' : '로그인'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="text-blue-400 hover:underline">
            회원가입
          </Link>
        </p>
      </div>

      {/* 퍼즐 인간검증 모달 팝업 */}
      {showCaptchaModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl shadow-2xl relative max-w-sm w-full">
            <button
              type="button"
              onClick={() => setShowCaptchaModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-lg"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-4 text-center text-white">보안 검증</h3>
            <PuzzleCaptcha isVerified={isVerified} onVerify={handleCaptchaVerified} />
          </div>
        </div>
      )}
    </div>
  );
}
