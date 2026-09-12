import { DetectionResult } from '../types/game';

/**
 * High-Precision Expression Classifier:
 * - Neutral / resting faces return 'unknown' (zero false positives)
 * - Only deliberate, pronounced expressions trigger valid matches
 */

const get = (blendshapes: { categoryName: string; score: number }[], name: string): number =>
  blendshapes.find(b => b.categoryName === name)?.score ?? 0;

export const classifyFromBlendshapes = (
  blendshapes: { categoryName: string; score: number }[]
): DetectionResult => {
  if (!blendshapes || blendshapes.length === 0) {
    return { expression: 'unknown', confidence: 0 };
  }

  // ── Blendshape Feature Extraction ─────────────────────────────────────────
  const smileLeft   = get(blendshapes, 'mouthSmileLeft');
  const smileRight  = get(blendshapes, 'mouthSmileRight');
  const smileScore  = (smileLeft + smileRight) / 2;

  const jawOpen     = get(blendshapes, 'jawOpen');

  const browUpL     = get(blendshapes, 'browOuterUpLeft');
  const browUpR     = get(blendshapes, 'browOuterUpRight');
  const browInnerUp = get(blendshapes, 'browInnerUp');
  const browUp      = Math.max(browUpL, browUpR, browInnerUp);

  const browDownL   = get(blendshapes, 'browDownLeft');
  const browDownR   = get(blendshapes, 'browDownRight');
  const browDownAvg = (browDownL + browDownR) / 2;

  const mouthFrownL = get(blendshapes, 'mouthFrownLeft');
  const mouthFrownR = get(blendshapes, 'mouthFrownRight');
  const mouthFrown  = (mouthFrownL + mouthFrownR) / 2;

  const noseSneerL  = get(blendshapes, 'noseSneerLeft');
  const noseSneerR  = get(blendshapes, 'noseSneerRight');
  const noseSneer   = (noseSneerL + noseSneerR) / 2;

  const blinkL      = get(blendshapes, 'eyeBlinkLeft');
  const blinkR      = get(blendshapes, 'eyeBlinkRight');

  const mouthPucker = get(blendshapes, 'mouthPucker');
  const mouthFunnel = get(blendshapes, 'mouthFunnel');

  const eyeWideL    = get(blendshapes, 'eyeWideLeft');
  const eyeWideR    = get(blendshapes, 'eyeWideRight');
  const eyeWide     = (eyeWideL + eyeWideR) / 2;

  // ── Strict Intentional Expression Classification ──────────────────────────

  // 1. SLEEPY (😴) — Both eyes firmly closed intentionally (> 0.62)
  if (blinkL > 0.62 && blinkR > 0.62) {
    const conf = Math.min(1, (blinkL + blinkR) / 2);
    return { expression: 'sleepy', confidence: parseFloat(conf.toFixed(2)) };
  }

  // 2. WINK (😉) — One eye closed firmly while the other is clearly open
  if (blinkL > 0.55 && blinkR < 0.25 && (blinkL - blinkR) > 0.35) {
    return { expression: 'wink', confidence: parseFloat(blinkL.toFixed(2)) };
  }
  if (blinkR > 0.55 && blinkL < 0.25 && (blinkR - blinkL) > 0.35) {
    return { expression: 'wink', confidence: parseFloat(blinkR.toFixed(2)) };
  }

  // 3. SURPRISED (😮) — Mouth wide open (> 0.45) OR mouth open with raised brows/eyes wide
  if (jawOpen > 0.45 || (jawOpen > 0.30 && (browUp > 0.35 || eyeWide > 0.35))) {
    const conf = Math.min(1, Math.max(jawOpen * 1.6, (browUp + eyeWide) / 1.5));
    return { expression: 'surprised', confidence: parseFloat(conf.toFixed(2)) };
  }

  // 4. ANGRY (😠) — Distinct brow furrow (both brows pulled down >= 0.42 or brow + sneer)
  const isAngry = (browDownAvg > 0.42 && browDownL > 0.35 && browDownR > 0.35) ||
                  (browDownAvg > 0.35 && (noseSneer > 0.35 || mouthFrown > 0.35));
  if (isAngry && smileScore < 0.25 && jawOpen < 0.25) {
    const conf = Math.min(1, Math.max(browDownAvg * 1.5, noseSneer * 1.8));
    return { expression: 'angry', confidence: parseFloat(conf.toFixed(2)) };
  }

  // 5. KISSY (😗) — Pronounced mouth pucker / duck face
  if ((mouthPucker > 0.40 || (mouthPucker > 0.32 && mouthFunnel > 0.30)) && jawOpen < 0.20 && smileScore < 0.25) {
    const conf = Math.min(1, Math.max(mouthPucker * 1.8, mouthFunnel * 1.6));
    return { expression: 'kiss', confidence: parseFloat(conf.toFixed(2)) };
  }

  // 6. HAPPY / SMILE (😊) — Genuine deliberate smile (smileScore > 0.42)
  if (smileScore > 0.42 && mouthPucker < 0.30) {
    const conf = Math.min(1, smileScore * 1.8);
    return { expression: 'smile', confidence: parseFloat(conf.toFixed(2)) };
  }

  // Neutral / Resting face -> Always return 'unknown'
  return { expression: 'unknown', confidence: 0 };
};

/**
 * Landmark-based fallback (used only if blendshapes are unavailable).
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

  const smileR = mouthWidth / faceWidth;
  const openR  = mouthOpenness / faceHeight;

  if (openR > 0.14) return { expression: 'surprised', confidence: Math.min(1, openR * 5) };
  if (smileR > 0.50) return { expression: 'smile', confidence: Math.min(1, (smileR - 0.45) * 5) };

  return { expression: 'unknown', confidence: 0 };
};
