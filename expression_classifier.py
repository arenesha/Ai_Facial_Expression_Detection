"""
Face Expression Classification Engine for Python.
Classifies facial expressions into:
- smile (😊 Happy)
- wink (😉 Wink)
- surprised (😮 Surprised)
- angry (😠 Angry)
- kiss (😗 Kissy / Pucker)
- sleepy (😴 Sleepy)
- unknown (Neutral / Resting)
"""

import math
from typing import List, Dict, Any, Tuple, Optional

EXPRESSION_META = {
    "smile": {"emoji": "😊", "label": "HAPPY"},
    "wink": {"emoji": "😉", "label": "WINK"},
    "surprised": {"emoji": "😮", "label": "SURPRISED"},
    "angry": {"emoji": "😠", "label": "ANGRY"},
    "kiss": {"emoji": "😗", "label": "KISSY"},
    "sleepy": {"emoji": "😴", "label": "SLEEPY"},
    "unknown": {"emoji": "😐", "label": "NEUTRAL"},
}

def euclidean_dist(p1, p2) -> float:
    """Calculates Euclidean distance between two points."""
    return math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2)

def calculate_ear(eye_landmarks: List[Tuple[float, float]]) -> float:
    """
    Computes Eye Aspect Ratio (EAR).
    eye_landmarks: [p1, p2, p3, p4, p5, p6]
    p1, p4: horizontal corners
    p2, p6 & p3, p5: vertical landmarks
    """
    if len(eye_landmarks) < 6:
        return 0.0
    v1 = euclidean_dist(eye_landmarks[1], eye_landmarks[5])
    v2 = euclidean_dist(eye_landmarks[2], eye_landmarks[4])
    h = euclidean_dist(eye_landmarks[0], eye_landmarks[3])
    if h == 0:
        return 0.0
    return (v1 + v2) / (2.0 * h)

def classify_from_landmarks(landmarks: List[Dict[str, float]]) -> Dict[str, Any]:
    """
    High-precision geometric classifier using 468/478 MediaPipe FaceMesh landmarks.
    landmarks is a list of objects or tuples with x, y, z normalized [0..1].
    """
    if not landmarks or len(landmarks) < 468:
        return {"expression": "unknown", "confidence": 0.0, "details": {}}

    # Convert to array of (x, y)
    pts = [(lm.x if hasattr(lm, 'x') else lm['x'], 
            lm.y if hasattr(lm, 'y') else lm['y']) for lm in landmarks]

    # Reference face scale
    # 10: top of forehead, 152: chin
    face_height = euclidean_dist(pts[10], pts[152])
    # 234: right cheek, 454: left cheek
    face_width = euclidean_dist(pts[234], pts[454])

    if face_height <= 0 or face_width <= 0:
        return {"expression": "unknown", "confidence": 0.0, "details": {}}

    # Left eye landmarks (indices: 33, 160, 158, 133, 153, 144)
    left_eye = [pts[33], pts[160], pts[158], pts[133], pts[153], pts[144]]
    # Right eye landmarks (indices: 362, 385, 387, 263, 373, 380)
    right_eye = [pts[362], pts[385], pts[387], pts[263], pts[373], pts[380]]

    ear_left = calculate_ear(left_eye)
    ear_right = calculate_ear(right_eye)
    avg_ear = (ear_left + ear_right) / 2.0

    # Mouth measurements
    # 61: left mouth corner, 291: right mouth corner
    mouth_width = euclidean_dist(pts[61], pts[291])
    # 13: upper lip inner, 14: lower lip inner
    mouth_openness = euclidean_dist(pts[13], pts[14])
    # 0: upper lip outer, 17: lower lip outer
    mouth_outer_open = euclidean_dist(pts[0], pts[17])

    norm_mouth_width = mouth_width / face_width
    norm_mouth_open = mouth_openness / face_height

    # Eyebrows
    # 70: left brow center, 300: right brow center
    # 159: left eye upper, 386: right eye upper
    brow_eye_dist_l = euclidean_dist(pts[70], pts[159]) / face_height
    brow_eye_dist_r = euclidean_dist(pts[300], pts[386]) / face_height
    avg_brow_dist = (brow_eye_dist_l + brow_eye_dist_r) / 2.0

    # Distance between inner eyebrows (107 and 336)
    brow_inner_dist = euclidean_dist(pts[107], pts[336]) / face_width

    # Mouth corners vs mouth center Y
    mouth_center_y = (pts[13][1] + pts[14][1]) / 2.0
    corners_avg_y = (pts[61][1] + pts[291][1]) / 2.0
    smile_lift = (mouth_center_y - corners_avg_y) / face_height

    details = {
        "ear_left": round(ear_left, 3),
        "ear_right": round(ear_right, 3),
        "norm_mouth_width": round(norm_mouth_width, 3),
        "norm_mouth_open": round(norm_mouth_open, 3),
        "smile_lift": round(smile_lift, 4),
        "avg_brow_dist": round(avg_brow_dist, 3),
        "brow_inner_dist": round(brow_inner_dist, 3)
    }

    # ── Rule-Based Classification with strict priority ──────────────────────────

    # 1. SLEEPY (😴): Both eyes firmly closed (EAR < 0.16)
    if ear_left < 0.16 and ear_right < 0.16:
        confidence = min(1.0, (0.22 - avg_ear) / 0.12)
        return {"expression": "sleepy", "confidence": round(max(0.5, confidence), 2), "details": details}

    # 2. WINK (😉): One eye closed, one clearly open
    if ear_left < 0.17 and ear_right > 0.24 and (ear_right - ear_left) > 0.08:
        conf = min(1.0, (ear_right - ear_left) * 4)
        return {"expression": "wink", "confidence": round(conf, 2), "details": details}
    if ear_right < 0.17 and ear_left > 0.24 and (ear_left - ear_right) > 0.08:
        conf = min(1.0, (ear_left - ear_right) * 4)
        return {"expression": "wink", "confidence": round(conf, 2), "details": details}

    # 3. SURPRISED (😮): Wide open mouth + raised brows
    if norm_mouth_open > 0.18 or (norm_mouth_open > 0.11 and avg_brow_dist > 0.19):
        conf = min(1.0, norm_mouth_open * 4.5)
        return {"expression": "surprised", "confidence": round(conf, 2), "details": details}

    # 4. KISSY / PUCKER (😗): Narrow mouth width + slight forward open
    if norm_mouth_width < 0.32 and mouth_outer_open > 0.04 and norm_mouth_open < 0.08:
        conf = min(1.0, (0.35 - norm_mouth_width) * 5)
        return {"expression": "kiss", "confidence": round(conf, 2), "details": details}

    # 5. HAPPY / SMILE (😊): High mouth width + corners lifted
    if norm_mouth_width > 0.48 or (norm_mouth_width > 0.43 and smile_lift > 0.015):
        conf = min(1.0, (norm_mouth_width - 0.40) * 5)
        return {"expression": "smile", "confidence": round(conf, 2), "details": details}

    # 6. ANGRY (😠): Eyebrows pulled together and downwards
    if brow_inner_dist < 0.15 and avg_brow_dist < 0.14:
        conf = min(1.0, (0.16 - avg_brow_dist) * 8)
        return {"expression": "angry", "confidence": round(conf, 2), "details": details}

    # Neutral / resting state
    return {"expression": "unknown", "confidence": 0.0, "details": details}
