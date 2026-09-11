import type { Expression, FaceDetectionResult, DetectionThresholds } from '@/types/game';

export const DEFAULT_THRESHOLDS: DetectionThresholds = {
  smileRatio: 0.42,       // lowered: easier smile detection
  mouthOpenRatio: 0.05,   // lowered: easier open-mouth detection
  minConfidence: 0.3,
  debounceFrames: 4,      // fewer frames needed = more responsive
};

/** Compute detection ratios from MediaPipe face landmarks (468-point model).
 *  Landmark indices (canonical face model):
 *    Left mouth corner:  61
 *    Right mouth corner: 291
 *    Upper lip center:   13
 *    Lower lip center:   14
 *    Left cheek (face w reference): 234
 *    Right cheek:        454
 */
export function computeExpressionRatios(
  landmarks: Array<{ x: number; y: number; z: number }>,
): { smileRatio: number; mouthOpenRatio: number } {
  try {
    const leftMouth = landmarks[61];
    const rightMouth = landmarks[291];
    const upperLip = landmarks[13];
    const lowerLip = landmarks[14];
    const leftFace = landmarks[234];
    const rightFace = landmarks[454];

    const mouthWidth = Math.hypot(
      rightMouth.x - leftMouth.x,
      rightMouth.y - leftMouth.y,
    );
    const faceWidth = Math.hypot(
      rightFace.x - leftFace.x,
      rightFace.y - leftFace.y,
    );
    const lipGap = Math.hypot(
      lowerLip.x - upperLip.x,
      lowerLip.y - upperLip.y,
    );

    const smileRatio = faceWidth > 0 ? mouthWidth / faceWidth : 0;
    const mouthOpenRatio = faceWidth > 0 ? lipGap / faceWidth : 0;

    return { smileRatio, mouthOpenRatio };
  } catch {
    return { smileRatio: 0, mouthOpenRatio: 0 };
  }
}

/** Map ratios to an Expression label */
export function classifyExpression(
  smileRatio: number,
  mouthOpenRatio: number,
  thresholds: DetectionThresholds = DEFAULT_THRESHOLDS,
): Expression {
  if (mouthOpenRatio >= thresholds.mouthOpenRatio) return 'open';
  if (smileRatio >= thresholds.smileRatio) return 'smile';
  return 'neutral';
}

/** Sliding-window debouncer */
export class ExpressionDebouncer {
  private history: Expression[] = [];
  private readonly windowSize: number;

  constructor(windowSize = DEFAULT_THRESHOLDS.debounceFrames) {
    this.windowSize = windowSize;
  }

  push(expression: Expression): Expression {
    this.history.push(expression);
    if (this.history.length > this.windowSize) {
      this.history.shift();
    }
    // require >= 80% agreement
    const counts: Record<string, number> = {};
    for (const e of this.history) counts[e] = (counts[e] ?? 0) + 1;
    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (dominant && dominant[1] / this.history.length >= 0.8) {
      return dominant[0] as Expression;
    }
    return 'unknown';
  }

  reset() {
    this.history = [];
  }
}

/** Compute a simple confidence score 0-1 based on how far from the threshold the ratios are */
export function computeConfidence(
  smileRatio: number,
  mouthOpenRatio: number,
  expression: Expression,
  thresholds: DetectionThresholds = DEFAULT_THRESHOLDS,
): number {
  if (expression === 'open') {
    return Math.min(1, mouthOpenRatio / thresholds.mouthOpenRatio);
  }
  if (expression === 'smile') {
    return Math.min(1, smileRatio / thresholds.smileRatio);
  }
  // neutral – how far from both thresholds
  const distSmile = Math.max(0, thresholds.smileRatio - smileRatio);
  const distOpen = Math.max(0, thresholds.mouthOpenRatio - mouthOpenRatio);
  return Math.min(1, (distSmile + distOpen) / (thresholds.smileRatio + thresholds.mouthOpenRatio));
}

export function buildDetectionResult(
  detected: boolean,
  expression: Expression,
  smileRatio: number,
  mouthOpenRatio: number,
  thresholds: DetectionThresholds = DEFAULT_THRESHOLDS,
): FaceDetectionResult {
  const confidence = detected
    ? computeConfidence(smileRatio, mouthOpenRatio, expression, thresholds)
    : 0;
  return { detected, expression, confidence, smileRatio, mouthOpenRatio };
}
