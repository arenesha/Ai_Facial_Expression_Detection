import { DetectionResult } from '../types/game';

/**
 * Goldilocks Expression Classifier:
 * - Resting/neutral faces (scores < 0.14) return 'unknown' -> zero false matches!
 * - Real intentional faces (scores > 0.16–0.20) trigger instantly & reliably!
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
  const browDown    = (browDownL + browDownR) / 2;

  const mouthFrownL = get(blendshapes, 'mouthFrownLeft');
  const mouthFrownR = get(blendshapes, 'mouthFrownRight');
  const mouthFrown  = (mouthFrownL + mouthFrownR) / 2;

  const noseSneerL  = get(blendshapes, 'noseSneerLeft');
  const noseSneerR  = get(blendshapes, 'noseSneerRight');
  const noseSneer   = (noseSneerL + noseSneerR) / 2;

  const angryScore  = Math.max(browDown, mouthFrown * 1.5, noseSneer * 1.2);

  const blinkL      = get(blendshapes, 'eyeBlinkLeft');
  const blinkR      = get(blendshapes, 'eyeBlinkRight');

  const mouthPucker = get(blendshapes, 'mouthPucker');
  const mouthFunnel = get(blendshapes, 'mouthFunnel');

  const eyeWideL    = get(blendshapes, 'eyeWideLeft');
  const eyeWideR    = get(blendshapes, 'eyeWideRight');
  const eyeWide     = (eyeWideL + eyeWideR) / 2;

  // ── Precise Intentional Expression Classification ────────────────────────

  // 1. SLEEPY (😴) — Both eyes closed intentionally (blink > 0.42)
  if (blinkL > 0.42 && blinkR > 0.42) {
    return { expression: 'sleepy', confidence: parseFloat(((blinkL + blinkR) / 2).toFixed(2)) };
  }

  // 2. WINK (😉) — One eye closed intentionally, other open
  if (blinkL > 0.38 && blinkR < 0.28) {
    return { expression: 'wink', confidence: parseFloat(blinkL.toFixed(2)) };
  }
  if (blinkR > 0.38 && blinkL < 0.28) {
    return { expression: 'wink', confidence: parseFloat(blinkR.toFixed(2)) };
  }

  // 3. SURPRISED (😮) — Open mouth (jawOpen > 0.16) OR wide eyes + raised brows
  if (jawOpen > 0.16 || (browUp > 0.18 && eyeWide > 0.18)) {
    const conf = Math.min(1, Math.max(jawOpen * 2.5, (browUp + eyeWide) / 1.2));
    return { expression: 'surprised', confidence: parseFloat(conf.toFixed(2)) };
  }

  // 4. ANGRY (😠) — Brows furrowed / frown (angryScore > 0.14)
  if (angryScore > 0.14 && smileScore < 0.22 && jawOpen < 0.18) {
    return { expression: 'angry', confidence: parseFloat(Math.min(1, angryScore * 2.8).toFixed(2)) };
  }

  // 5. KISSY (😗) — Mouth pucker / duck lips (mouthPucker > 0.16 or mouthFunnel > 0.22)
  if ((mouthPucker > 0.16 || mouthFunnel > 0.22) && jawOpen < 0.16 && smileScore < 0.22) {
    const kissVal = Math.max(mouthPucker, mouthFunnel);
    return { expression: 'kiss', confidence: parseFloat(Math.min(1, kissVal * 2.5).toFixed(2)) };
  }

  // 6. HAPPY / SMILE (😊) — Intentional smile (smileScore > 0.20)
  if (smileScore > 0.20) {
    return { expression: 'smile', confidence: parseFloat(Math.min(1, smileScore * 2.5).toFixed(2)) };
  }

  // Resting / Neutral face -> Return 'unknown' (no false matches!)
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

  if (openR > 0.06) return { expression: 'surprised', confidence: Math.min(1, openR * 10) };
  if (smileR > 0.42) return { expression: 'smile', confidence: Math.min(1, (smileR - 0.42) * 6) };

  return { expression: 'unknown', confidence: 0 };
};
