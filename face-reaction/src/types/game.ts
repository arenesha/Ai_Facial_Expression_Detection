export type Expression = 
  | 'smile' 
  | 'wink' 
  | 'surprised' 
  | 'angry' 
  | 'kiss' 
  | 'sleepy';

export const EXPRESSIONS: Record<Expression, { emoji: string; label: string }> = {
  smile: { emoji: '😊', label: 'HAPPY' },
  wink: { emoji: '😉', label: 'WINK' },
  surprised: { emoji: '😮', label: 'SURPRISED' },
  angry: { emoji: '😠', label: 'ANGRY' },
  kiss: { emoji: '😗', label: 'KISSY' },
  sleepy: { emoji: '😴', label: 'SLEEPY' },
};

export type GameState = 
  | 'IDLE'
  | 'INITIALIZING_CAMERA'
  | 'CAMERA_READY'
  | 'WAITING_FOR_FACE'
  | 'FACE_DETECTED'
  | 'READY'
  | 'COUNTDOWN'
  | 'PLAYING'
  | 'PAUSED'
  | 'GAME_OVER';

export interface Target {
  id: string; // Unique ID for animations
  expression: Expression;
}

export interface GameMetrics {
  score: number;
  combo: number;
  bestCombo: number;
  matched: number;
  missed: number;
  totalReactionTimeMs: number;
}

export interface DetectionResult {
  expression: Expression | 'unknown';
  confidence: number;
}
