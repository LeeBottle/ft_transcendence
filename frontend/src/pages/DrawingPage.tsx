import Win98Canvas from '../components/Win98Canvas';

export default function DrawingPage() {
  return (
    <div className="p-8">
      <h2 className="mb-2 text-center text-3xl font-bold">🎨 모두의 그림판</h2>
      <p className="mb-8 text-center text-gray-400">접속한 사람들과 실시간으로 그림을 남겨보세요.</p>
      <Win98Canvas />
    </div>
  );
}
