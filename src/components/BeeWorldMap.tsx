import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { IconButton, Dialog, DialogContent } from '@mui/material';
import { Close as CloseIcon, Public as WorldIcon } from '@mui/icons-material';
import TouchControls from './TouchControls';
import PixiCanvas from './pixi/PixiCanvas';
import { MapRenderer } from './pixi/MapRenderer';
import { loadWorldsFromJSON } from '../utils/worldLoader';
import { useCharacterMovement } from '../hooks/useCharacterMovement';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { World } from '../types/WorldTypes';

const BeeWorldMap: React.FC = () => {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [currentWorld, setCurrentWorld] = useState(0);
  const [currentNodeId, setCurrentNodeId] = useState(1);
  const [iframeOpen, setIframeOpen] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  
  const mapRendererRef = useRef<MapRenderer | null>(null);
  const worldsRef = useRef<World[]>([]);

  // Cargar mundos
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedWorlds = await loadWorldsFromJSON();
        setWorlds(loadedWorlds);
        worldsRef.current = loadedWorlds;
        setCurrentNodeId(loadedWorlds[0].startNodeId);
      } catch (error) {
        console.error('Error cargando mundos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Detectar móvil
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Inicializar PixiJS
  const handleAppReady = useCallback((app: PIXI.Application, container: PIXI.Container) => {
    mapRendererRef.current = new MapRenderer(container);
    
    if (worlds.length > 0) {
      const world = worlds[currentWorld];
      mapRendererRef.current.renderMap(world, currentNodeId);
      setMapReady(true);
    }
  }, [worlds, currentWorld, currentNodeId]);

  // Renderizar mapa cuando se carguen los mundos por primera vez
  useEffect(() => {
    if (!mapRendererRef.current || worldsRef.current.length === 0 || mapReady) return;
    
    const loadMap = async () => {
      const world = worldsRef.current[currentWorld];
      await mapRendererRef.current?.renderMap(world, currentNodeId);
      setMapReady(true);
    };
    
    loadMap();
  }, [worlds, currentWorld, currentNodeId, mapReady]);

  // Renderizar mapa SOLO cuando cambie de mundo
  useEffect(() => {
    if (!mapRendererRef.current || worldsRef.current.length === 0 || !mapReady) return;
    
    const loadMap = async () => {
      const world = worldsRef.current[currentWorld];
      console.log('🔄 Cambio de mundo detectado');
      await mapRendererRef.current?.renderMap(world, currentNodeId);
    };
    
    loadMap();
  }, [currentWorld]);

  // Actualizar SOLO el highlight de nodos
  useEffect(() => {
    if (!mapRendererRef.current || worldsRef.current.length === 0 || !mapReady) return;
    
    const world = worldsRef.current[currentWorld];
    mapRendererRef.current.updateNodeHighlight(world, currentNodeId);
  }, [currentNodeId]);

  // Movimiento del personaje
  const { moveCharacter } = useCharacterMovement({
    worlds: worldsRef.current,
    currentWorld,
    currentNodeId,
    setCurrentNodeId,
    mapRenderer: mapRendererRef.current
  }); 

  // Abrir página
  const openPage = useCallback(() => {
    if (worldsRef.current.length === 0) return;
    
    const world = worldsRef.current[currentWorld];
    const node = world.nodes.find(n => n.id === currentNodeId);
    if (!node || node.type === 'connector' || !node.url) return;
    
    setIframeUrl(node.url);
    setIframeOpen(true);
  }, [currentWorld, currentNodeId]);

  // Cambiar mundo
  const changeWorld = useCallback(() => {
    if (worldsRef.current.length === 0) return;
    
    const newWorld = (currentWorld + 1) % worldsRef.current.length;
    setCurrentWorld(newWorld);
    setCurrentNodeId(worldsRef.current[newWorld].startNodeId);
  }, [currentWorld]);

  // Controles de teclado - solo habilitar cuando el mapa esté listo
  useKeyboardControls({
    onLeft: () => moveCharacter('left'),
    onRight: () => moveCharacter('right'),
    onUp: () => moveCharacter('up'),
    onDown: () => moveCharacter('down'),
    onEnter: openPage,
    enabled: !iframeOpen && mapReady
  }); 

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Cargando mundos...</p>
      </div>
    );
  }

  if (worlds.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-red-600">Error al cargar los mundos</p>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-blue-200 to-green-200">
      <div className="absolute top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm shadow-lg">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-600">🐝 Mapa de nodos</h1>
          <button
            onClick={changeWorld}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
          >
            <WorldIcon />
            <span className="hidden md:inline">{worlds[currentWorld].name}</span>
          </button>
        </div>
      </div>

      <div className="w-full h-full flex items-center justify-center pt-20">
        {worlds.length > 0 && (
          <PixiCanvas 
            onAppReady={handleAppReady}
            onCleanup={() => mapRendererRef.current?.clear()}
          />
        )}
      </div>

      {isMobile && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <TouchControls
            onLeft={() => moveCharacter('left')}
            onRight={() => moveCharacter('right')}
            onUp={() => moveCharacter('up')}
            onDown={() => moveCharacter('down')}
            onEnter={openPage}
          />
        </div>
      )}

      <div className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-xl px-6 py-4 shadow-2xl border-2 border-yellow-400">
        <p className="text-lg md:text-xl text-gray-800 font-medium">
          <span className="hidden md:block mb-2">
            <span className="text-2xl">⌨️</span> Usa las flechas <kbd className="px-2 py-1 bg-gray-200 rounded">←</kbd> <kbd className="px-2 py-1 bg-gray-200 rounded">→</kbd> <kbd className="px-2 py-1 bg-gray-200 rounded">↑</kbd> <kbd className="px-2 py-1 bg-gray-200 rounded">↓</kbd>
          </span>
          <span className="text-xl">🎯</span> Presiona <kbd className="px-3 py-2 bg-green-500 text-white rounded font-bold">ENTER</kbd> para explorar
        </p>
      </div>

      <Dialog 
        open={iframeOpen} 
        onClose={() => setIframeOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent className="p-0 h-[80vh]">
          <div className="flex justify-end p-2 bg-gray-100">
            <IconButton onClick={() => setIframeOpen(false)}>
              <CloseIcon />
            </IconButton>
          </div>
          <iframe
            src={iframeUrl}
            className="w-full h-full border-0"
            title="Contenido"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BeeWorldMap;
