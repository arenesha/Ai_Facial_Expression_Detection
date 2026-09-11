import { useState } from 'react';
import { Game } from './pages/Game';
import { Home } from './pages/Home';
import './index.css';

type Screen = 'home' | 'game';

function App() {
  const [screen, setScreen] = useState<Screen>('home');

  if (screen === 'game') {
    return <Game onExit={() => setScreen('home')} />;
  }
  return <Home onStart={() => setScreen('game')} />;
}

export default App;
