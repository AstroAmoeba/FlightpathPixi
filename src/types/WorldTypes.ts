export interface NodeData {
  id: number;
  gridX: number;
  gridY: number;
  title: string;
  url: string;
  type: 'level' | 'connector';
  connections: {
    up?: number;
    down?: number;
    left?: number;
    right?: number;
  };
}

export interface Node extends NodeData {
  x: number;
  y: number;
}

export interface WorldData {
  id: number;
  name: string;
  nodes: NodeData[];
  startNodeId: number;
}

export interface World {
  id: number;
  name: string;
  nodes: Node[];
  startNodeId: number;
}

export interface WorldsData {
  worlds: WorldData[];
}
