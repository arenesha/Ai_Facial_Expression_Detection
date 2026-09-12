import { Game } from './pages/Game';
import { DuplicateTabOverlay } from './components/ui/DuplicateTabOverlay';
import './index.css';

function App() {
  return (
    <>
      <DuplicateTabOverlay />
      <Game />
    </>
  );
}

export default App;
