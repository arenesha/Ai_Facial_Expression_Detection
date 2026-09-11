export type Expression = 'smile' | 'surprised' | 'neutral' | 'angry' | 'wink' | 'sad';

export const EXPRESSIONS: Record<Expression, { emoji: string; label: string }> = {
  smile: { emoji: '😊', label: 'SMILE' },
  surprised: { emoji: '😮', label: 'SURPRISED' },
  neutral: { emoji: '😐', label: 'NEUTRAL' },
  angry: { emoji: '😠', label: 'ANGRY' },
  wink: { emoji: '😉', label: 'WINK' },
  sad: { emoji: '😢', label: 'SAD' }
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
