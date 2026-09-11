import { SoundProvider } from '@/hooks/useSound';
import { Game } from '@/pages/Game';

export default function App() {
  return (
    <SoundProvider>
      <Game />
    </SoundProvider>
  );
}
