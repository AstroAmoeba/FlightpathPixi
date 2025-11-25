import * as PIXI from 'pixi.js';
import { World, Node } from '../../types/WorldTypes';

/**
 * Clase para renderizar el mapa (nodos, líneas, personaje)
 */
export class MapRenderer {
  private container: PIXI.Container;
  private nodeGraphics: Map<number, PIXI.Container>;
  private character: PIXI.Container | null;
  private linesContainer: PIXI.Container;
  private nodesContainer: PIXI.Container;
  private lastHighlightedNodeId: number | null = null;
  private backgroundSprite: PIXI.Sprite | null = null;
  private levelTexture: PIXI.Texture | null = null;
  private connectorTexture: PIXI.Texture | null = null;
  private lineTexture: PIXI.Texture | null = null;

  constructor(container: PIXI.Container) {
    this.container = container;
    this.nodeGraphics = new Map();
    this.character = null;
    
    this.linesContainer = new PIXI.Container();
    this.nodesContainer = new PIXI.Container();
    
    this.container.addChild(this.linesContainer as any);
    this.container.addChild(this.nodesContainer as any);

    this.loadTextures(); // Cargar texturas al inicializar
  }

  /**
   * Carga las texturas para los nodos
   */
  private async loadTextures(): Promise<void> {
    try {
      this.levelTexture = await PIXI.Assets.load('/assets/textures/level.png');
      this.connectorTexture = await PIXI.Assets.load('/assets/textures/connector.png');
      this.lineTexture = await PIXI.Assets.load('/assets/textures/line.png'); // Load the line texture
      console.log('✅ Texturas cargadas correctamente');
    } catch (error) {
      console.error('❌ Error al cargar texturas:', error);
    }
  }

  /**
   * Dibuja las líneas de conexión entre nodos
   */
  private drawConnections(world: World): void {
    // Clear previous lines
    this.linesContainer.removeChildren();

    world.nodes.forEach(node => {
      Object.entries(node.connections).forEach(([direction, targetId]) => {
        if (!targetId) return;

        const targetNode = world.nodes.find(n => n.id === targetId);
        if (!targetNode) return;

        // Calculate the angle between the nodes
        const angle = Math.atan2(targetNode.y - node.y, targetNode.x - node.x);

        // Calculate the distance between the nodes
        const totalDistance = Math.sqrt(
          Math.pow(targetNode.x - node.x, 2) + Math.pow(targetNode.y - node.y, 2)
        );

        // Adjust the distance to account for the size of the nodes
        const nodeRadius = 25; // Assuming nodes have a radius of 25 (adjust as needed)
        const adjustedDistance = totalDistance - nodeRadius;

        // Create a TilingSprite for the line
        const line = new PIXI.TilingSprite(
          this.lineTexture || PIXI.Texture.WHITE, // Fallback to a white texture if lineTexture is not loaded
          adjustedDistance,
          8 // Line thickness
        );

        // Set the anchor to center the line
        line.anchor.set(0, 0.5);

        // Set the position and rotation of the line
        line.position.set(
          node.x + Math.cos(angle) * nodeRadius,
          node.y + Math.sin(angle) * nodeRadius
        );
        line.rotation = angle;

        // Add the line to the container
        this.linesContainer.addChild(line as unknown as PIXI.DisplayObject);
      });
    });
  }

  /**
   * Dibuja un nodo de nivel con textura
   */
  private drawLevelNode(node: Node, isSelected: boolean): PIXI.Container {
    const nodeContainer = new PIXI.Container();

    if (this.levelTexture) {
      const sprite = new PIXI.Sprite(this.levelTexture);
      sprite.width = 50;
      sprite.height = 50;
      sprite.anchor.set(0.5);
      sprite.tint = isSelected ? 0xFFD700 : 0xFFFFFF; // Apply tint for selection
      nodeContainer.addChild(sprite as unknown as PIXI.DisplayObject);
    } else {
      const circle = new PIXI.Graphics();
      circle.beginFill(isSelected ? 0xFFD700 : 0xFFFFFF);
      circle.lineStyle(3, 0x8B4513);
      circle.drawCircle(0, 0, 25);
      circle.endFill();
      nodeContainer.addChild(circle as unknown as PIXI.DisplayObject);
    }

    if (node.title) {
      const text = new PIXI.Text(node.title, {
        fontSize: 11,
        fill: 0x000000,
        fontWeight: 'bold',
        wordWrap: true,
        wordWrapWidth: 80,
        align: 'center',
      });
      text.anchor.set(0.5);
      text.position.set(0, -40);
      nodeContainer.addChild(text as unknown as PIXI.DisplayObject);
    }

    return nodeContainer;
  }

  /**
   * Dibuja un nodo conector con textura
   */
  private drawConnectorNode(): PIXI.Container {
    const nodeContainer = new PIXI.Container();

    if (this.connectorTexture) {
      const sprite = new PIXI.Sprite(this.connectorTexture);
      sprite.width = 30;
      sprite.height = 30;
      sprite.anchor.set(0.5);
      nodeContainer.addChild(sprite as unknown as PIXI.DisplayObject);
    } else {
      const circle = new PIXI.Graphics();
      circle.beginFill(0x8B4513);
      circle.drawCircle(0, 0, 8);
      circle.endFill();
      nodeContainer.addChild(circle as unknown as PIXI.DisplayObject);
    }

    return nodeContainer;
  }

  /**
   * 🗺️ SPRITE DEL MAPA: Carga el sprite de fondo del mundo desde una imagen
   * Coloca tu imagen en: public/assets/sprites/world1-bg.png
   */
  private async loadWorldBackground(worldId: number): Promise<void> {
    // Remover fondo anterior si existe
    if (this.backgroundSprite && this.backgroundSprite.parent) {
      this.container.removeChild(this.backgroundSprite as any);
    }

    try {
      // 🗺️ CAMBIAR AQUÍ: Ruta a tu sprite de fondo del mundo
      const texture = await PIXI.Assets.load(`/assets/sprites/world${worldId}-bg.png`);
      this.backgroundSprite = new PIXI.Sprite(texture);
      
      // Ajustar tamaño y posición del fondo
      this.backgroundSprite.width = this.container.width || 1400;
      this.backgroundSprite.height = this.container.height || 800;
      this.backgroundSprite.position.set(0, 0);
      
      // Agregar al fondo (índice 0)
      this.container.addChildAt(this.backgroundSprite as any, 0);
    } catch (error) {
      console.warn(`⚠️ No se pudo cargar el fondo del mundo ${worldId}. Usando fondo por defecto.`);
    }
  }

  /**
   * SPRITE DEL JUGADOR: Actualmente dibuja la abeja con código (Graphics)
   * Para usar sprites de imagen, coloca la imagen en: public/assets/sprites/bee.png
   */
  private async createCharacter(nodeType: string): Promise<PIXI.Container> {
    const character = new PIXI.Container();

    try {
      // Determine the texture based on the node type
      const texturePath = nodeType === 'level' 
        ? '/assets/textures/bee2.png' 
        : '/assets/textures/bee.png';

      const texture = await PIXI.Assets.load(texturePath);
      const beeSprite = new PIXI.Sprite(texture);

      beeSprite.width = 50;
      beeSprite.height = 50;
      beeSprite.anchor.set(0.5);

      character.addChild(beeSprite as unknown as PIXI.DisplayObject);

      console.log(`✅ Sprite del jugador cargado desde ${texturePath}`);
    } catch (error) {
      console.warn('⚠️ No se pudo cargar el sprite del jugador. Usando dibujo por defecto.');

      // Fallback to a default bee drawing if the texture fails to load
      const body = new PIXI.Graphics();
      body.beginFill(0xFFD700);
      body.drawEllipse(0, 0, 18, 12);
      body.endFill();

      const wing1 = new PIXI.Graphics();
      wing1.beginFill(0xFFFFFF, 0.7);
      wing1.drawEllipse(-10, -8, 8, 12);
      wing1.endFill();

      const wing2 = new PIXI.Graphics();
      wing2.beginFill(0xFFFFFF, 0.7);
      wing2.drawEllipse(10, -8, 8, 12);
      wing2.endFill();

      character.addChild(wing1 as unknown as PIXI.DisplayObject);
      character.addChild(wing2 as unknown as PIXI.DisplayObject);
      character.addChild(body as unknown as PIXI.DisplayObject);
    }

    return character;
  }

  /**
   * Renderiza todo el mapa (solo llamar cuando cambie de mundo)
   */
  async renderMap(world: World, currentNodeId: number): Promise<void> {
    await this.loadTextures(); // Asegúrate de que las texturas estén cargadas

    // 🗺️ SPRITE DEL MAPA: Cargar fondo del mundo
    await this.loadWorldBackground(world.id);
    
    // Limpiar solo los contenedores de líneas y nodos (NO el personaje)
    this.linesContainer.removeChildren();
    this.nodesContainer.removeChildren();
    this.nodeGraphics.clear();

    // 🗺️ SPRITE DEL MAPA: Dibuja todas las líneas de conexión
    this.drawConnections(world);

    // 🗺️ SPRITE DEL MAPA: Dibuja todos los nodos en el contenedor
    world.nodes.forEach(node => {
      const isSelected = node.id === currentNodeId;
      
      const nodeContainer = node.type === 'level'
        ? this.drawLevelNode(node, isSelected)
        : this.drawConnectorNode();

      nodeContainer.position.set(node.x, node.y);
      this.nodesContainer.addChild(nodeContainer as any);
      this.nodeGraphics.set(node.id, nodeContainer);
    });

    // Remover personaje anterior si existe
    if (this.character && this.character.parent) {
      this.container.removeChild(this.character as any);
      this.character = null;
    }

    // 🐝 SPRITE DEL JUGADOR: Crea y posiciona el personaje en el mapa
    const currentNode = world.nodes.find(n => n.id === currentNodeId);
    if (currentNode) {
      this.character = await this.createCharacter(currentNode.type);
      this.container.addChild(this.character as any);
      this.character.position.set(currentNode.x, currentNode.y);
    }
    

    this.lastHighlightedNodeId = currentNodeId;
  }

  updateNodeHighlight(world: World, currentNodeId: number): void {
    // Si es el mismo nodo, no hacer nada
    if (this.lastHighlightedNodeId === currentNodeId) {
      return;
    }
    
    // Batch updates para evitar múltiples redraws
    const updates: Array<() => void> = [];
    
    // Des-seleccionar nodo anterior
    if (this.lastHighlightedNodeId !== null) {
      const prevGraphic = this.nodeGraphics.get(this.lastHighlightedNodeId);
      const prevNode = world.nodes.find(n => n.id === this.lastHighlightedNodeId);
      
      if (prevGraphic && prevNode && prevNode.type === 'level' && prevGraphic.children[0]) {
        updates.push(() => {
          const circle = prevGraphic.children[0] as PIXI.Graphics;
          circle.clear();
          circle.beginFill(0xFFFFFF);
          circle.lineStyle(3, 0x8B4513);
          circle.drawCircle(0, 0, 25);
          circle.endFill();
        });
      }
    }
    
    // Seleccionar nodo actual
    const currentGraphic = this.nodeGraphics.get(currentNodeId);
    const currentNode = world.nodes.find(n => n.id === currentNodeId);
    
    if (currentGraphic && currentNode && currentNode.type === 'level' && currentGraphic.children[0]) {
      updates.push(() => {
        const circle = currentGraphic.children[0] as PIXI.Graphics;
        circle.clear();
        circle.beginFill(0xFFD700);
        circle.lineStyle(3, 0x8B4513);
        circle.drawCircle(0, 0, 25);
        circle.endFill();
      });
    }
    
    // Ejecutar todas las actualizaciones en un solo batch
    updates.forEach(update => update());
    
    this.lastHighlightedNodeId = currentNodeId;
  }

  /**
   * Obtiene el personaje
   */
  getCharacter(): PIXI.Container | null {
    return this.character;
  }

  /**
   * Limpia los recursos
   */
  clear(): void {
    this.linesContainer.removeChildren();
    this.nodesContainer.removeChildren();
    this.nodeGraphics.clear();
    
    // Remover fondo del mundo
    if (this.backgroundSprite && this.backgroundSprite.parent) {
      this.container.removeChild(this.backgroundSprite as any);
      this.backgroundSprite = null;
    }
    
    // Remover personaje del container principal
    if (this.character && this.character.parent) {
      this.container.removeChild(this.character as any);
    }
    this.character = null;
  }
}
