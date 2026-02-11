
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadWorldsFromJSON } from '../utils/worldLoader';
import { World, Node } from '../types/WorldTypes';

const NodeListPage: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  useEffect(() => {
    const fetchNodes = async () => {
      const worlds: World[] = await loadWorldsFromJSON();
      // Extraer todos los nodos tipo 'level' de todos los mundos
      const allLevelNodes = worlds.flatMap(world => world.nodes.filter(node => node.type === 'level'));
      // Filtrar nodos duplicados por título (ej: "Obreras")
      const uniqueNodesMap = new Map();
      allLevelNodes.forEach(node => {
        if (!uniqueNodesMap.has(node.title)) {
          uniqueNodesMap.set(node.title, node);
        }
      });
      setNodes(Array.from(uniqueNodesMap.values()));
      setLoading(false);
    };
    fetchNodes();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><p>Cargando nodos...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-green-100 p-8">
      <h2 className="text-3xl font-bold text-yellow-700 mb-6">Lista de Nodos (niveles)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nodes.map(node => {
          // Si el nodo es "Obreras" del minimapa, hacer navegación especial
          if (node.title === 'Obreras') {
            return (
              <button
                key={node.id}
                className="block w-full bg-green-200 rounded-lg shadow-md p-4 text-lg font-bold text-green-900 text-center border-2 border-green-400 hover:bg-green-300 transition-colors cursor-pointer"
                style={{ textDecoration: 'none' }}
                onClick={() => navigate('/', { state: { gotoWorldName: 'Minimapa', gotoNodeId: node.id } })}
              >
                {node.title} <span className="ml-2 text-xs">(Ir a minimapa)</span>
              </button>
            );
          }
          // Por defecto, enlace normal
          return (
            <a
              key={node.id}
              href={node.url}
              className="block bg-white rounded-lg shadow-md p-4 text-lg font-medium text-gray-800 text-center border border-yellow-300 hover:bg-yellow-100 transition-colors cursor-pointer"
              style={{ textDecoration: 'none' }}
              target="_blank" rel="noopener noreferrer"
            >
              {node.title}
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default NodeListPage;
