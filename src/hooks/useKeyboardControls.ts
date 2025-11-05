import { useEffect } from 'react';

interface UseKeyboardControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onUp: () => void;
  onDown: () => void;
  onEnter: () => void;
  enabled: boolean;
}

export const useKeyboardControls = ({
  onLeft,
  onRight,
  onUp,
  onDown,
  onEnter,
  enabled
}: UseKeyboardControlsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!enabled) return;
      
      // Prevenir scroll del navegador con las flechas
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.key)) {
        e.preventDefault();
      }
      
      switch(e.key) {
        case 'ArrowLeft':
          onLeft();
          break;
        case 'ArrowRight':
          onRight();
          break;
        case 'ArrowUp':
          onUp();
          break;
        case 'ArrowDown':
          onDown();
          break;
        case 'Enter':
          onEnter();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onLeft, onRight, onUp, onDown, onEnter]);
};
