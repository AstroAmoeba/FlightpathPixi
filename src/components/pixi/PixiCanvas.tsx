import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

interface PixiCanvasProps {
  onAppReady: (app: PIXI.Application, container: PIXI.Container) => void;
  onCleanup?: () => void;
}

/**
 * Componente que inicializa el canvas de PixiJS
 */
const PixiCanvas: React.FC<PixiCanvasProps> = ({ onAppReady, onCleanup }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Calcular tamaño basado en el viewport
    const width = Math.min(window.innerWidth * 0.98, 1600); // Increased width to 98% of viewport and max 1600
    const height = Math.min(window.innerHeight * 0.90, 1000); // Increased height to 85% of viewport and max 900

    // INICIALIZACIÓN: Aquí se crea la aplicación PixiJS (el canvas principal)
    const app = new PIXI.Application({
      width,
      height,
      backgroundColor: 0x87CEEB,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    canvasRef.current.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;

    // 🗺️ SPRITE DEL MAPA: Aquí se crea el contenedor principal para el mapa
    const container = new PIXI.Container();
    app.stage.addChild(container as any);

    // 🗺️ SPRITE DEL MAPA: Aquí se dibuja el fondo del mapa (suelo verde)
    const background = new PIXI.Graphics();
    background.beginFill(0x90EE90);
    background.drawRect(0, height - 50, width, 50);
    background.endFill();
    container.addChild(background as any);

    onAppReady(app, container);

    // Manejar redimensionamiento
    const handleResize = () => {
      const newWidth = Math.min(window.innerWidth * 0.98, 1600); // Match updated width
      const newHeight = Math.min(window.innerHeight * 0.85, 900); // Match updated height
      app.renderer.resize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      onCleanup?.();
      app.destroy(true, { children: true });
      appRef.current = null;
    };
  }, [onAppReady, onCleanup]);

  return (
    <div 
      ref={canvasRef} 
      className="flex justify-center items-center"
      style={{ touchAction: 'none' }} // Previene scroll en móviles
    />
  );
};

export default PixiCanvas;
