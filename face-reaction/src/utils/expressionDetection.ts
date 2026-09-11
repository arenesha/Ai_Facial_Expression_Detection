import { DetectionResult } from '../types/game';

/**
 * Uses MediaPipe face blendshape scores (52 pre-computed coefficients)
 * instead of raw landmark geometry. Blendshapes are person-independent,
 * normalized 0→1, and directly reflect action units like smiling, jaw open,
 * eye blink, brow furrow — making expression classification far more reliable.
 */

// Helper: get a blendshape score by name
const get = (blendshapes: { categoryName: string; score: number }[], name: string): number =>
  blendshapes.find(b => b.categoryName === name)?.score ?? 0;

export const classifyFromBlendshapes = (
  blendshapes: { categoryName: string; score: number }[]
): DetectionResult => {
  if (!blendshapes || blendshapes.length === 0) {
    return { expression: 'unknown', confidence: 0 };
  }

  // ── Individual scores ──────────────────────────────────────────────────────
  const smileLeft  = get(blendshapes, 'mouthSmileLeft');
  const smileRight = get(blendshapes, 'mouthSmileRight');
  const smileScore = (smileLeft + smileRight) / 2;

  const jawOpen    = get(blendshapes, 'jawOpen');
  const browUpL    = get(blendshapes, 'browOuterUpLeft');
  const browUpR    = get(blendshapes, 'browOuterUpRight');
  const browUp     = (browUpL + browUpR) / 2;
  const browDownL  = get(blendshapes, 'browDownLeft');
  const browDownR  = get(blendshapes, 'browDownRight');
  const browDown   = (browDownL + browDownR) / 2;

  const blinkL     = get(blendshapes, 'eyeBlinkLeft');
  const blinkR     = get(blendshapes, 'eyeBlinkRight');

  // ── Classification (priority order) ──────────────────────────────────────

  // WINK — one eye closed, other open
  if (blinkL > 0.55 && blinkR < 0.35) {
    return { expression: 'wink', confidence: parseFloat(blinkL.toFixed(2)) };
  }
  if (blinkR > 0.55 && blinkL < 0.35) {
    return { expression: 'wink', confidence: parseFloat(blinkR.toFixed(2)) };
  }

  // SURPRISED — jaw wide open AND brows raised
  if (jawOpen > 0.35 && browUp > 0.15) {
    const conf = Math.min(1, (jawOpen + browUp) / 1.5);
    return { expression: 'surprised', confidence: parseFloat(conf.toFixed(2)) };
  }

  // SMILE — both lip corners raised
  if (smileScore > 0.30) {
    return { expression: 'smile', confidence: parseFloat(Math.min(1, smileScore * 2).toFixed(2)) };
  }

  // ANGRY — brows furrowed, mouth closed
  if (browDown > 0.35 && smileScore < 0.15 && jawOpen < 0.15) {
    return { expression: 'angry', confidence: parseFloat(Math.min(1, browDown * 1.5).toFixed(2)) };
  }

  // NEUTRAL — fallback: nothing strong detected
  // A face with no dominant expression is neutral
  if (smileScore < 0.20 && jawOpen < 0.15 && (blinkL < 0.5 && blinkR < 0.5) && browDown < 0.25) {
    return { expression: 'neutral', confidence: 0.80 };
  }

  return { expression: 'unknown', confidence: 0 };
};

/**
 * Landmark-based fallback (used only if blendshapes are unavailable).
 * Less reliable — depends on face geometry ratios that vary by person.
 */
export const classifyFromLandmarks = (
  landmarks: { x: number; y: number; z: number }[]
): DetectionResult => {
  if (!landmarks || landmarks.length < 478) return { expression: 'unknown', confidence: 0 };

  const faceHeight = landmarks[152].y - landmarks[10].y;
  const faceWidth  = landmarks[454].x - landmarks[234].x;
  if (faceHeight <= 0 || faceWidth <= 0) return { expression: 'unknown', confidence: 0 };

  const mouthWidth     = landmarks[291].x - landmarks[61].x;
  const mouthOpenness  = landmarks[17].y  - landmarks[0].y;
  const leftEyeH       = landmarks[145].y - landmarks[159].y;
  const rightEyeH      = landmarks[374].y - landmarks[386].y;
  const leftBrowEyeGap = landmarks[159].y - landmarks[105].y;
  const rightBrowEyeGap= landmarks[386].y - landmarks[334].y;

  const smileR    = mouthWidth / faceWidth;
  const openR     = mouthOpenness / faceHeight;
  const eyeAsym   = Math.abs(leftEyeH - rightEyeH) / faceHeight;
  const browGapR  = ((leftBrowEyeGap + rightBrowEyeGap) / 2) / faceHeight;

  // WINK
  if (eyeAsym > 0.018 && (leftEyeH < faceHeight * 0.015 || rightEyeH < faceHeight * 0.015)) {
    return { expression: 'wink', confidence: Math.min(1, eyeAsym * 35) };
  }
  // SURPRISED
  if (openR > 0.07 && browGapR > 0.085) {
    return { expression: 'surprised', confidence: Math.min(1, openR * 10) };
  }
  // SMILE
  if (smileR > 0.43 && openR < 0.12) {
    return { expression: 'smile', confidence: Math.min(1, (smileR - 0.43) * 6) };
  }
  // ANGRY
  if (browGapR < 0.045 && openR < 0.08) {
    return { expression: 'angry', confidence: Math.min(1, (0.045 - browGapR) * 25) };
  }
  // NEUTRAL fallback
  return { expression: 'neutral', confidence: 0.75 };
};
