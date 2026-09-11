// Game type definitions

export type Expression = 'neutral' | 'smile' | 'open' | 'unknown';
export type TargetExpression = 'happy' | 'sad' | 'surprised' | 'angry' | 'neutral' | 'silly';
export type Move = 'rock' | 'paper' | 'scissors';
export type RoundResult = 'win' | 'lose' | 'draw';
export type GameMode = 'classic' | 'timeattack' | 'endless';
export type GamePhase =
  | 'idle'        // waiting to start
  | 'countdown'
  | 'detecting'   // camera active, user matching
  | 'matched'     // expression matched successfully
  | 'timeout'     // ran out of time
  | 'gameover';

export interface RoundRecord {
  round: number;
  playerMove: Move;
  computerMove: Move;
  result: RoundResult;
  expression: Expression;
  confidence: number;
}

export interface GameState {
  mode: GameMode;
  phase: GamePhase;
  round: number;
  maxRounds: number;
  playerScore: number;
  computerScore: number;
  winStreak: number;
  bestStreak: number;
  rounds: RoundRecord[];
  timeLeft?: number; // for Time Attack mode
  consecutiveLosses?: number; // for Endless mode
}

export interface FaceDetectionResult {
  detected: boolean;
  expression: Expression;
  confidence: number;
  smileRatio: number;
  mouthOpenRatio: number;
  blendshapes?: Record<string, number>;
}

export interface DetectionThresholds {
  smileRatio: number;
  mouthOpenRatio: number;
  minConfidence: number;
  debounceFrames: number;
}

export interface PersistentStats {
  highScore: number;
  bestStreak: number;
  gamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
}

export const MOVE_LABELS: Record<Move, string> = {
  rock: 'Rock',
  paper: 'Paper',
  scissors: 'Scissors',
};

export const MOVE_EMOJI: Record<Move, string> = {
  rock: '🪨',
  paper: '📄',
  scissors: '✂️',
};

export const EXPRESSION_TO_MOVE: Record<Exclude<Expression, 'unknown'>, Move> = {
  neutral: 'rock',
  smile: 'paper',
  open: 'scissors',
};

export const EXPRESSION_LABELS: Record<Expression, string> = {
  neutral: 'Neutral',
  smile: 'Smile',
  open: 'Open Mouth',
  unknown: 'Unknown',
};

export const EXPRESSION_EMOJI: Record<Expression, string> = {
  neutral: '😐',
  smile: '😄',
  open: '😮',
  unknown: '❓',
};

// ---------- Face Reaction Game Mappings ----------

export interface TargetExpressionData {
  label: string;
  emoji: string;
  /** Which detected expression(s) satisfy this target */
  matchesDetection: Expression[];
}

export const TARGET_EXPRESSIONS: Record<TargetExpression, TargetExpressionData> = {
  happy:     { label: 'Happy',     emoji: '😊', matchesDetection: ['smile'] },
  sad:       { label: 'Sad',       emoji: '😢', matchesDetection: ['neutral'] },  // neutral/resting
  surprised: { label: 'Surprised', emoji: '😲', matchesDetection: ['open'] },
  angry:     { label: 'Angry',     emoji: '😠', matchesDetection: ['neutral'] },  // neutral/tense
  neutral:   { label: 'Neutral',   emoji: '😐', matchesDetection: ['neutral'] },
  silly:     { label: 'Silly',     emoji: '😜', matchesDetection: ['open', 'smile'] },
};

export const ALL_TARGET_EXPRESSIONS: TargetExpression[] = [
  'happy', 'sad', 'surprised', 'angry', 'neutral', 'silly',
];
