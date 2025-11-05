import { useCallback, useRef, useEffect } from 'react';
import { World } from '../types/WorldTypes';
import { MapRenderer } from '../components/pixi/MapRenderer';

interface UseCharacterMovementProps {
  worlds: World[];
  currentWorld: number;
  currentNodeId: number;
  setCurrentNodeId: (id: number) => void;
  mapRenderer: MapRenderer | null;
  onNodeChange?: () => void;
}

export const useCharacterMovement = ({
  worlds,
  currentWorld,
  currentNodeId,
  setCurrentNodeId,
  mapRenderer,
  onNodeChange
}: UseCharacterMovementProps) => {
  const animationRef = useRef<number | null>(null);

  /**
   * Mueve el personaje a un nodo adyacente
   */
  const moveCharacter = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (worlds.length === 0) return;
    
    const world = worlds[currentWorld];
    const currentNode = world.nodes.find(n => n.id === currentNodeId);
    if (!currentNode) return;

    const nextNodeId = currentNode.connections[direction];
    if (nextNodeId) {
      setCurrentNodeId(nextNodeId);
    }
  }, [currentWorld, currentNodeId, worlds, setCurrentNodeId]);

  /**
   * Anima el movimiento del personaje
   */
  useEffect(() => {
    if (!mapRenderer || worlds.length === 0) return;

    const world = worlds[currentWorld];
    const currentNode = world.nodes.find(n => n.id === currentNodeId);
    if (!currentNode) return;

    // 🐝 SPRITE DEL JUGADOR: Aquí se obtiene el sprite del personaje para animarlo
    const character = mapRenderer.getCharacter();
    if (!character || !character.position) return;

    const targetX = currentNode.x;
    const targetY = currentNode.y;
    
    // Si ya está en la posición, no animar (evita parpadeos)
    const distance = Math.sqrt(
      Math.pow(character.position.x - targetX, 2) + 
      Math.pow(character.position.y - targetY, 2)
    );
    
    if (distance < 1) {
      return;
    }
        
    const duration = 300;
    const startX = character.position.x;
    const startY = character.position.y;
    const startTime = Date.now();

    const animate = () => {
      const currentCharacter = mapRenderer.getCharacter();
      if (!currentCharacter || !currentCharacter.position) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        return;
      }
      
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      
      // 🐝 SPRITE DEL JUGADOR: Aquí se actualiza la posición del sprite durante la animación
      currentCharacter.position.x = startX + (targetX - startX) * eased;
      currentCharacter.position.y = startY + (targetY - startY) * eased;

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
        onNodeChange?.();
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [currentNodeId, currentWorld, worlds, mapRenderer, onNodeChange]);

  return { moveCharacter };
};
