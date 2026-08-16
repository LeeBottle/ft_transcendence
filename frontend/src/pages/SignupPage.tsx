import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: '비밀번호가 일치하지 않습니다.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          nickname: formData.nickname,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(Array.isArray(data.message) ? data.message.join(', ') : data.message || '회원가입 실패');
      }

      setMessage({ type: 'success', text: '회원가입에 성공했습니다! 로그인 페이지로 이동합니다.' });
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">회원가입</h2>

        {message && (
          <div
            className={`p-3 rounded mb-4 text-sm ${
              message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">이메일</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">닉네임</label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={10}
              className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">비밀번호 확인</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-white"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded font-semibold transition duration-200"
          >
            {isSubmitting ? '처리 중...' : '가입하기'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-blue-400 hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
