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
 * Carga los mundos desde ambos JSON
 */
export const loadWorldsFromJSON = async (): Promise<World[]> => {
  try {
    // Cargar ambos archivos
    const [resp1, resp2] = await Promise.all([
      fetch('/data/mapa.json'),
      fetch('/data/worlds.json')
    ]);

    if (!resp1.ok && !resp2.ok) {
      throw new Error('No se pudo cargar ningún archivo de mundos');
    }

    let worlds: WorldData[] = [];

    if (resp1.ok) {
      const data1: WorldsData = await resp1.json();
      worlds = worlds.concat(data1.worlds);
    }
    if (resp2.ok) {
      const data2: WorldsData = await resp2.json();
      worlds = worlds.concat(data2.worlds);
    }

    const convertedWorlds = worlds.map(convertGridToPixels);
    return convertedWorlds;
  } catch (error) {
    console.error('❌ Error cargando mundos:', error);
    throw error;
  }
};
