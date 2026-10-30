import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AVATAR_UPLOAD' | 'NICKNAME' | 'PASSWORD'>('OVERVIEW');
  const [newNickname, setNewNickname] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 이미지 업로드 관련 상태
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="p-16 text-center text-gray-900 dark:text-gray-100">
        <p className="mb-4 text-sm font-medium">로그인이 필요합니다.</p>
        <Link to="/login" className="px-4 py-2 bg-blue-600 text-white font-bold text-xs hover:bg-blue-700">
          로그인
        </Link>
      </div>
    );
  }

  // 📷 사용자가 컴퓨터에서 이미지를 선택했을 때 정사각형으로 리사이즈 및 미리보기
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일(PNG, JPG, WebP 등)만 업로드할 수 있습니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // 정사각형으로 중앙 크롭하여 256x256 캔버스에 그리기
        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPreviewImage(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // 아바타 서버 저장 API 호출
  const handleSaveAvatar = async () => {
    if (!previewImage) return;

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ avatar: previewImage }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '아바타 변경 실패');

      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setPreviewImage(null);
      setImgError(false);
      window.dispatchEvent(new Event('auth-change'));
      setMessage({ type: 'success', text: '아바타 이미지가 성공적으로 변경되었습니다.' });
      setActiveTab('OVERVIEW');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // 아바타 삭제 (이미지 없음 상태로 리셋)
  const handleDeleteAvatar = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ avatar: null }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '아바타 삭제 실패');

      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setPreviewImage(null);
      setImgError(false);
      window.dispatchEvent(new Event('auth-change'));
      setMessage({ type: 'success', text: '아바타 이미지가 삭제되었습니다.' });
      setActiveTab('OVERVIEW');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNickname.trim()) return;

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ nickname: newNickname.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '닉네임 변경 실패');

      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setNewNickname('');
      window.dispatchEvent(new Event('auth-change'));
      setMessage({ type: 'success', text: '닉네임이 변경되었습니다.' });
      setActiveTab('OVERVIEW');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '비밀번호 변경 실패');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: '비밀번호가 변경되었습니다.' });
      setActiveTab('OVERVIEW');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // 아바타 렌더링 헬퍼 (정사각형 크롭 및 이미지 없음 폴백)
  const hasValidAvatar = user.avatar && !imgError && user.avatar.length > 5;

  return (
    <div className="max-w-4xl mx-auto px-4 my-8 text-gray-900 dark:text-white">
      {/* 1. 상단 프로필 헤더 (사각 박스 & 정사각형 중앙 크롭 아바타) */}
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-6 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          {/* 정사각형 아바타 프레임 (중앙 크롭, 없으면 이미지 없음 글자) */}
          <div className="w-20 h-20 aspect-square border border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 overflow-hidden flex items-center justify-center shrink-0">
            {hasValidAvatar ? (
              <img
                src={user.avatar}
                alt="아바타"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[11px] text-gray-500 font-medium text-center leading-tight">
                이미지<br />없음
              </span>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-xl font-bold">{user.nickname}</h2>
              {user.equippedTitle && (
                <span className="text-xs border border-gray-300 dark:border-gray-600 px-2 py-0.5 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700">
                  [{user.equippedTitle}]
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 font-mono">{user.email}</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab(activeTab === 'AVATAR_UPLOAD' ? 'OVERVIEW' : 'AVATAR_UPLOAD')}
          className="border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          아바타 사진 변경
        </button>
      </div>

      {message && (
        <div
          className={`p-3 border text-xs font-medium mb-6 ${
            message.type === 'success'
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
              : 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 2. 아바타 직접 이미지 업로드 서브 탭 */}
      {activeTab === 'AVATAR_UPLOAD' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xs uppercase text-gray-700 dark:text-gray-300">직접 이미지 파일 업로드</h3>
            <button onClick={() => { setActiveTab('OVERVIEW'); setPreviewImage(null); }} className="text-xs text-gray-500 hover:underline">닫기</button>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 items-center">
            {/* 정사각형 미리보기 박스 */}
            <div className="w-24 h-24 aspect-square border-2 border-dashed border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 overflow-hidden flex items-center justify-center shrink-0">
              {previewImage ? (
                <img src={previewImage} alt="미리보기" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[11px] text-gray-400 text-center">선택한<br/>이미지</span>
              )}
            </div>

            <div className="space-y-3 flex-1">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="text-xs text-gray-600 dark:text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:border file:border-gray-300 file:text-xs file:font-medium file:bg-gray-100 hover:file:bg-gray-200 cursor-pointer"
              />
              <p className="text-[11px] text-gray-500">
                • 내 컴퓨터에서 사진을 선택하면 정사각형(1:1) 비율로 자동 중앙 크롭됩니다.
              </p>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSaveAvatar}
                  disabled={loading || !previewImage}
                  className="px-4 py-1.5 bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? '저장 중...' : '선택한 이미지 적용'}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  disabled={loading || !user.avatar}
                  className="px-3 py-1.5 border border-red-300 text-red-600 hover:bg-red-50 text-xs disabled:opacity-40"
                >
                  기본값(이미지 없음)으로 초기화
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. 닉네임 변경 폼 */}
      {activeTab === 'NICKNAME' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-xs uppercase text-gray-600 dark:text-gray-400">닉네임 변경</h3>
            <button onClick={() => setActiveTab('OVERVIEW')} className="text-xs text-gray-500 hover:underline">닫기</button>
          </div>
          <form onSubmit={handleUpdateNickname} className="space-y-3 max-w-sm">
            <input
              type="text"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              placeholder="새 닉네임 입력 (2~10자)"
              required
              minLength={2}
              maxLength={10}
              className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('OVERVIEW')}
                className="px-3 py-1 border border-gray-300 text-xs"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1 bg-blue-600 text-white font-bold text-xs hover:bg-blue-700"
              >
                {loading ? '변경 중...' : '저장'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. 비밀번호 변경 폼 */}
      {activeTab === 'PASSWORD' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-xs uppercase text-gray-600 dark:text-gray-400">비밀번호 변경</h3>
            <button onClick={() => setActiveTab('OVERVIEW')} className="text-xs text-gray-500 hover:underline">닫기</button>
          </div>
          <form onSubmit={handleUpdatePassword} className="space-y-3 max-w-sm">
            <div>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호"
                required
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs outline-none"
              />
            </div>
            <div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호 (6자 이상)"
                required
                minLength={6}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs outline-none"
              />
            </div>
            <div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호 확인"
                required
                minLength={6}
                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-xs outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('OVERVIEW')}
                className="px-3 py-1 border border-gray-300 text-xs"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1 bg-blue-600 text-white font-bold text-xs hover:bg-blue-700"
              >
                {loading ? '변경 중...' : '비밀번호 저장'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. 메인 네비게이션 카드 */}
      <nav className="grid gap-3 sm:grid-cols-2">
        <div
          onClick={() => setActiveTab('NICKNAME')}
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
        >
          <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">닉네임 관리</h3>
          <p className="text-xs text-gray-500">현재 닉네임을 변경하고 중복 검사</p>
        </div>

        <Link
          to="/titles"
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-750"
        >
          <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">칭호 보관함</h3>
          <p className="text-xs text-gray-500">보유 칭호 장착 및 미보유 칭호 확인</p>
        </Link>

        <Link
          to="/matches"
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 hover:bg-gray-50 dark:hover:bg-gray-750"
        >
          <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">경기 기록</h3>
          <p className="text-xs text-gray-500">전적 통계 및 지난 경기 스코어보드</p>
        </Link>

        <div
          onClick={() => setActiveTab('PASSWORD')}
          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
        >
          <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">비밀번호 설정</h3>
          <p className="text-xs text-gray-500">계정 비밀번호를 안전하게 변경</p>
        </div>
      </nav>
    </div>
  );
}
