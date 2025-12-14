import { useEffect, useRef, useCallback } from 'react';
import { useNotificationsContext } from '../context/NotificationsContext';
import { useTranslation } from 'react-i18next';

export const useRdvNotifications = (rdvs: Array<{ id: number; status: string; bien: string }>) => {
  const { addNotification } = useNotificationsContext();
  const { t } = useTranslation();
  const previousStatusRef = useRef<Map<number, string>>(new Map());
  const lastSoundTimeRef = useRef<number>(0);

  // Play notification sound (throttled)
  const playNotificationSound = useCallback(() => {
    const now = Date.now();
    // Throttle sound to max once per 500ms
    if (now - lastSoundTimeRef.current < 500) {
      return;
    }
    lastSoundTimeRef.current = now;

    try {
      const audioContextClass = window.AudioContext || 
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new audioContextClass();

      const playBeep = (frequency: number, duration: number, delay: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime + delay);
        oscillator.stop(audioContext.currentTime + delay + duration);
      };

      playBeep(800, 0.1, 0);
      playBeep(1000, 0.1, 0.15);
      playBeep(800, 0.2, 0.3);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, []);

  // Detect status changes and create notifications
  useEffect(() => {
    rdvs.forEach((rdv) => {
      const previousStatus = previousStatusRef.current.get(rdv.id);

      // Only notify when status transitions to accepted or rejected
      if (
        previousStatus !== rdv.status &&
        (rdv.status === 'confirmed' || rdv.status === 'rejected')
      ) {
        const title = rdv.status === 'confirmed' 
          ? t('notifications.rdvAccepted') || 'RDV Accepté'
          : t('notifications.rdvRejected') || 'RDV Refusé';
        
        const message = rdv.status === 'confirmed'
          ? `Votre RDV pour ${rdv.bien} a été accepté`
          : `Votre RDV pour ${rdv.bien} a été refusé`;

        addNotification(
          'rdv-response',
          title,
          message,
          rdv.id
        );

        playNotificationSound();
      }

      // Update previous status
      previousStatusRef.current.set(rdv.id, rdv.status);
    });
  }, [rdvs, addNotification, playNotificationSound, t]);
};
