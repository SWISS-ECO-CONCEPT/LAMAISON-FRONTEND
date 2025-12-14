import { useEffect, useRef } from 'react';

export const useNotificationSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const resumedRef = useRef(false);
  const lastSoundTimeRef = useRef<number>(0);
  const soundThrottleMs = 300;

  const initAudioContext = () => {
    const audioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!audioContextRef.current) {
      audioContextRef.current = new audioContextClass();
    }
    return audioContextRef.current;
  };

  // 🔹 Reprendre l’audio après une interaction utilisateur
  useEffect(() => {
    const resumeOnInteraction = () => {
      const ctx = initAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().then(() => {
          resumedRef.current = true;
          console.log('[Audio] AudioContext resumed after user gesture');
        });
      }
    };

    document.addEventListener('click', resumeOnInteraction, { once: true });
    document.addEventListener('keydown', resumeOnInteraction, { once: true });

    return () => {
      document.removeEventListener('click', resumeOnInteraction);
      document.removeEventListener('keydown', resumeOnInteraction);
    };
  }, []);

  const canPlaySound = (): boolean => {
    const now = Date.now();
    if (now - lastSoundTimeRef.current >= soundThrottleMs) {
      lastSoundTimeRef.current = now;
      return true;
    }
    return false;
  };

  const playBeep = (audioContext: AudioContext, frequency: number, duration: number, delay: number, gain = 0.3) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(gain, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime + delay);
    oscillator.stop(audioContext.currentTime + delay + duration);
  };

  const playSound = () => {
    if (!canPlaySound()) return;
    const ctx = initAudioContext();
    if (!ctx) return;

    playBeep(ctx, 800, 0.1, 0);
    playBeep(ctx, 1000, 0.1, 0.15);
    playBeep(ctx, 800, 0.2, 0.3);
  };

  const playErrorSound = () => {
    if (!canPlaySound()) return;
    const ctx = initAudioContext();
    if (!ctx) return;

    playBeep(ctx, 400, 0.15, 0, 0.2);
    playBeep(ctx, 400, 0.15, 0.2, 0.2);
    playBeep(ctx, 400, 0.2, 0.4, 0.2);
  };

  return { playSound, playErrorSound };
}