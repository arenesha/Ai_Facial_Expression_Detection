import React from 'react';
import { DetectionResult } from '@/types/game';

interface FaceOverlayProps {
  detection: DetectionResult;
  faceCount: number;
  cameraStatus: 'OFF' | 'INITIALIZING' | 'DETECTING' | 'NO_FACE' | 'FACE_DETECTED';
}

export const FaceOverlay: React.FC<FaceOverlayProps> = ({
  faceCount,
}) => {
  const isFaceDetected = faceCount >= 1;

  if (!isFaceDetected) return null;

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {/* ── Delicate Holographic Face Mesh (Clear, subtle AI tracking) ── */}
      <div className="relative w-48 h-60 flex items-center justify-center">
        <svg className="w-full h-full opacity-65 filter drop-shadow-[0_0_6px_rgba(76,227,255,0.7)]" viewBox="0 0 200 240">
          {/* Forehead Triangulation Grid */}
          <path d="M 50 50 L 75 35 L 100 30 L 125 35 L 150 50 L 135 68 L 100 65 L 65 68 Z" stroke="#4ce3ff" strokeWidth="0.8" strokeDasharray="2 2" fill="none" opacity="0.6" />
          <path d="M 75 35 L 100 65 M 125 35 L 100 65 M 50 50 L 65 68 M 150 50 L 135 68" stroke="#4ce3ff" strokeWidth="0.8" strokeDasharray="2 2" fill="none" opacity="0.5" />

          {/* Left Eyebrow Contour & Mesh */}
          <path d="M 40 75 Q 65 62 90 74" stroke="#4ce3ff" strokeWidth="1.6" fill="none" />
          <path d="M 40 75 L 55 68 L 75 66 L 90 74" stroke="#4ce3ff" strokeWidth="0.8" fill="none" opacity="0.7" />

          {/* Right Eyebrow Contour & Mesh */}
          <path d="M 110 74 Q 135 62 160 75" stroke="#4ce3ff" strokeWidth="1.6" fill="none" />
          <path d="M 110 74 L 125 66 L 145 68 L 160 75" stroke="#4ce3ff" strokeWidth="0.8" fill="none" opacity="0.7" />

          {/* Glabella / Brow Bridge Connectors */}
          <path d="M 90 74 L 100 78 L 110 74 L 100 65 Z" stroke="#4ce3ff" strokeWidth="0.9" fill="none" opacity="0.6" />

          {/* Left Eye Contours & Pupil */}
          <ellipse cx="65" cy="94" rx="14" ry="7.5" stroke="#4ce3ff" strokeWidth="1.5" fill="none" />
          <ellipse cx="65" cy="94" rx="7" ry="4" stroke="#4ce3ff" strokeWidth="0.8" strokeDasharray="2 2" fill="none" opacity="0.8" />
          <circle cx="65" cy="94" r="2.5" fill="#4ce3ff" />
          <path d="M 51 94 L 40 75 M 79 94 L 90 74 M 65 86 L 65 70" stroke="#4ce3ff" strokeWidth="0.7" strokeDasharray="2 2" fill="none" opacity="0.5" />

          {/* Right Eye Contours & Pupil */}
          <ellipse cx="135" cy="94" rx="14" ry="7.5" stroke="#4ce3ff" strokeWidth="1.5" fill="none" />
          <ellipse cx="135" cy="94" rx="7" ry="4" stroke="#4ce3ff" strokeWidth="0.8" strokeDasharray="2 2" fill="none" opacity="0.8" />
          <circle cx="135" cy="94" r="2.5" fill="#4ce3ff" />
          <path d="M 121 94 L 110 74 M 149 94 L 160 75 M 135 86 L 135 70" stroke="#4ce3ff" strokeWidth="0.7" strokeDasharray="2 2" fill="none" opacity="0.5" />

          {/* Nose Bridge, Ridge & Nostril Wings */}
          <path d="M 100 78 L 95 105 L 92 130 L 100 138 L 108 130 L 105 105 Z" stroke="#4ce3ff" strokeWidth="1.4" fill="none" />
          <path d="M 82 132 Q 92 138 100 138 Q 108 138 118 132" stroke="#4ce3ff" strokeWidth="1.4" fill="none" />
          <path d="M 79 94 L 95 105 M 121 94 L 105 105 M 95 105 L 100 138 M 105 105 L 100 138" stroke="#4ce3ff" strokeWidth="0.8" strokeDasharray="2 2" fill="none" opacity="0.6" />

          {/* Cheekbones & Midface Triangulations */}
          <path d="M 51 94 L 35 115 L 48 142 L 82 132 M 35 115 L 40 75" stroke="#4ce3ff" strokeWidth="0.8" strokeDasharray="3 3" fill="none" opacity="0.5" />
          <path d="M 149 94 L 165 115 L 152 142 L 118 132 M 165 115 L 160 75" stroke="#4ce3ff" strokeWidth="0.8" strokeDasharray="3 3" fill="none" opacity="0.5" />

          {/* Philtrum */}
          <path d="M 96 138 L 96 152 M 104 138 L 104 152" stroke="#4ce3ff" strokeWidth="0.8" strokeDasharray="2 2" fill="none" opacity="0.7" />

          {/* Mouth & Smiling Lips Contour */}
          <path d="M 60 160 Q 100 178 140 160 Q 100 168 60 160" stroke="#4ce3ff" strokeWidth="1.6" fill="none" />
          <path d="M 60 160 Q 100 152 140 160" stroke="#4ce3ff" strokeWidth="1.2" fill="none" />
          <path d="M 72 163 Q 100 182 128 163" stroke="#4ce3ff" strokeWidth="1" strokeDasharray="2 2" fill="none" opacity="0.8" />
          <path d="M 60 160 L 82 132 M 140 160 L 118 132 M 100 138 L 100 155" stroke="#4ce3ff" strokeWidth="0.8" strokeDasharray="2 2" fill="none" opacity="0.6" />

          {/* Chin & Jawline Triangulation */}
          <path d="M 32 95 Q 30 150 65 195 L 100 215 L 135 195 Q 170 150 168 95" stroke="#4ce3ff" strokeWidth="1.5" fill="none" />
          <path d="M 60 160 L 65 195 L 100 215 L 135 195 L 140 160" stroke="#4ce3ff" strokeWidth="0.9" strokeDasharray="2 2" fill="none" opacity="0.6" />
          <path d="M 100 176 L 100 215 M 82 188 L 100 215 L 118 188" stroke="#4ce3ff" strokeWidth="0.8" strokeDasharray="2 2" fill="none" opacity="0.5" />

          {/* Dense Landmark Nodes (Dots) */}
          <circle cx="50" cy="50" r="2" fill="#4ce3ff" />
          <circle cx="75" cy="35" r="2" fill="#4ce3ff" />
          <circle cx="100" cy="30" r="2" fill="#4ce3ff" />
          <circle cx="125" cy="35" r="2" fill="#4ce3ff" />
          <circle cx="150" cy="50" r="2" fill="#4ce3ff" />
          <circle cx="40" cy="75" r="2.2" fill="#4ce3ff" />
          <circle cx="65" cy="68" r="2" fill="#4ce3ff" />
          <circle cx="90" cy="74" r="2.2" fill="#4ce3ff" />
          <circle cx="110" cy="74" r="2.2" fill="#4ce3ff" />
          <circle cx="135" cy="68" r="2" fill="#4ce3ff" />
          <circle cx="160" cy="75" r="2.2" fill="#4ce3ff" />
          <circle cx="51" cy="94" r="2" fill="#4ce3ff" />
          <circle cx="65" cy="94" r="2.5" fill="#4ce3ff" />
          <circle cx="79" cy="94" r="2" fill="#4ce3ff" />
          <circle cx="121" cy="94" r="2" fill="#4ce3ff" />
          <circle cx="135" cy="94" r="2.5" fill="#4ce3ff" />
          <circle cx="149" cy="94" r="2" fill="#4ce3ff" />
          <circle cx="100" cy="78" r="2" fill="#4ce3ff" />
          <circle cx="95" cy="105" r="2" fill="#4ce3ff" />
          <circle cx="105" cy="105" r="2" fill="#4ce3ff" />
          <circle cx="82" cy="132" r="2.2" fill="#4ce3ff" />
          <circle cx="92" cy="130" r="2" fill="#4ce3ff" />
          <circle cx="100" cy="138" r="2.5" fill="#4ce3ff" />
          <circle cx="108" cy="130" r="2" fill="#4ce3ff" />
          <circle cx="118" cy="132" r="2.2" fill="#4ce3ff" />
          <circle cx="35" cy="115" r="2" fill="#4ce3ff" />
          <circle cx="165" cy="115" r="2" fill="#4ce3ff" />
          <circle cx="48" cy="142" r="2" fill="#4ce3ff" />
          <circle cx="152" cy="142" r="2" fill="#4ce3ff" />
          <circle cx="60" cy="160" r="2.5" fill="#4ce3ff" />
          <circle cx="100" cy="155" r="2" fill="#4ce3ff" />
          <circle cx="140" cy="160" r="2.5" fill="#4ce3ff" />
          <circle cx="100" cy="176" r="2.2" fill="#4ce3ff" />
          <circle cx="65" cy="195" r="2" fill="#4ce3ff" />
          <circle cx="135" cy="195" r="2" fill="#4ce3ff" />
          <circle cx="100" cy="215" r="2.5" fill="#4ce3ff" />
        </svg>
      </div>
    </div>
  );
};

