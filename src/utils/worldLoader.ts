import { WorldData, World, WorldsData } from '../types/WorldTypes';

const GRID_SIZE = 80;

/**
 * Convierte coordenadas de grid a píxeles
 */
export const convertGridToPixels = (worldData: WorldData): World => {
  return {
    id: worldData.id,
    name: worldData.name,
    startNodeId: worldData.startNodeId,
    nodes: worldData.nodes.map(node => ({
      ...node,
      x: node.gridX * GRID_SIZE,
      y: node.gridY * GRID_SIZE
    }))
  };
};

/**
 * Carga los mundos desde el JSON
 */
export const loadWorldsFromJSON = async (): Promise<World[]> => {
  try {
    console.log('Intentando cargar mapa.json...');
    const response = await fetch('/data/mapa.json');

    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    const data: WorldsData = JSON.parse(text);
    
    const convertedWorlds = data.worlds.map(convertGridToPixels);
    console.log('✅ Mundos cargados exitosamente desde JSON');
    
    return convertedWorlds;
  } catch (error) {
    console.error('❌ Error cargando mundos:', error);
    throw error;
  }
};
