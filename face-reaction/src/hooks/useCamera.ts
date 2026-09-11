import { useState, useEffect, useRef, useCallback } from 'react';

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: false
      });
      
      streamRef.current = stream;
      setPermissionState('granted');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise((resolve) => {
            if (!videoRef.current) return resolve(null);
            videoRef.current.onloadedmetadata = () => {
                resolve(null);
            }
        });
        await videoRef.current.play();
        setIsReady(true);
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setPermissionState('denied');
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else {
        setError('Could not access camera. Please make sure you have a webcam connected.');
      }
      console.error('Camera error:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsReady(false);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    isReady,
    error,
    permissionState,
    startCamera,
    stopCamera
  };
};
