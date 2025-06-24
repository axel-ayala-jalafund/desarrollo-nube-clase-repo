import { useRef } from "react";

export const useNotificationSound = () => {
  const audioRef = useRef(null);

  const createNotificationSound = () => {
    if (!audioRef.current) {
      try {
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();

        const playNotificationSound = () => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(
            600,
            audioContext.currentTime + 0.1
          );

          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.3
          );

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        };

        audioRef.current = playNotificationSound;
      } catch (error) {
        console.warn("No se pudo crear el sonido de notificación:", error);
        audioRef.current = () => {};
      }
    }
  };

  const playSound = () => {
    createNotificationSound();
    if (audioRef.current) {
      try {
        audioRef.current();
      } catch (error) {
        console.warn("Error reproduciendo sonido:", error);
      }
    }
  };

  return { playSound };
};
