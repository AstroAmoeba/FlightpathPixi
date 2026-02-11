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
    // Cargar los tres archivos
    const [resp1, resp2, respMini] = await Promise.all([
      fetch('/data/mapa.json'),
      fetch('/data/worlds.json'),
      fetch('/data/minimap.json')
    ]);

    if (!resp1.ok && !resp2.ok && !respMini.ok) {
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
    if (respMini.ok) {
      // El minimapa no tiene estructura de worlds, hay que adaptarlo
      const dataMini = await respMini.json();
      // Asumimos que el primer nodo es el inicial
      const startNodeId = dataMini.nodes && dataMini.nodes.length > 0 ? dataMini.nodes[0].id : 1;
      const miniWorld: WorldData = {
        id: 999,
        name: 'Minimapa',
        startNodeId,
        nodes: dataMini.nodes
      };
      worlds.push(miniWorld);
    }

    const convertedWorlds = worlds.map(convertGridToPixels);
    return convertedWorlds;
  } catch (error) {
    console.error('❌ Error cargando mundos:', error);
    throw error;
  }
};
