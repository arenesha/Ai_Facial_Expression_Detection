import { useState, useEffect, useRef } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export const useFaceLandmarker = () => {
  const [landmarker, setLandmarker] = useState<FaceLandmarker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);

  useEffect(() => {
    let active = true;

    const initializeMediaPipe = async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm"
        );
        
        const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1
        });

        if (active) {
          setLandmarker(faceLandmarker);
          landmarkerRef.current = faceLandmarker;
          setIsLoaded(true);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load MediaPipe model');
          console.error("MediaPipe Init Error:", err);
        }
      }
    };

    initializeMediaPipe();

    return () => {
      active = false;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
    };
  }, []);

  return { landmarker, isLoaded, error };
};
