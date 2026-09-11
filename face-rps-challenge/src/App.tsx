import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SoundProvider } from '@/hooks/useSound';
import { Home } from '@/pages/Home';
import { Game } from '@/pages/Game';
import { Result } from '@/pages/Result';

export default function App() {
  return (
    <SoundProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/result" element={<Result />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SoundProvider>
  );
}
