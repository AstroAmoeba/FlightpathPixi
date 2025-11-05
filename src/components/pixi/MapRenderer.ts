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

  constructor(container: PIXI.Container) {
    this.container = container;
    this.nodeGraphics = new Map();
    this.character = null;
    
    this.linesContainer = new PIXI.Container();
    this.nodesContainer = new PIXI.Container();
    
    this.container.addChild(this.linesContainer as any);
    this.container.addChild(this.nodesContainer as any);
  }

  /**
   * Dibuja las líneas de conexión entre nodos
   */
  private drawConnections(world: World): void {
    // 🗺️ SPRITE DEL MAPA: Aquí se dibujan las líneas de conexión del mapa
    // Limpiar líneas anteriores primero
    this.linesContainer.removeChildren();
    
    world.nodes.forEach(node => {
      Object.entries(node.connections).forEach(([direction, targetId]) => {
        if (!targetId) return;
        
        const targetNode = world.nodes.find(n => n.id === targetId);
        if (!targetNode) return;

        if (direction === 'right' || direction === 'down') {
          // 🗺️ SPRITE DEL MAPA: Aquí se crean las líneas (Graphics) que conectan los nodos
          const line = new PIXI.Graphics();
          line.lineStyle(4, 0x8B4513);
          line.moveTo(node.x, node.y);
          line.lineTo(targetNode.x, targetNode.y);
          this.linesContainer.addChild(line as any);
        }
      });
    });
  }

  /**
   * Dibuja un nodo de nivel
   */
  private drawLevelNode(node: Node, isSelected: boolean): PIXI.Container {
    // 🗺️ SPRITE DEL MAPA: Actualmente dibuja círculos con código (Graphics)
    const nodeContainer = new PIXI.Container();
    
    // ESTO ES LO QUE SE ESTÁ DIBUJANDO AHORA
    // ═══════════════════════════════════════
    const circle = new PIXI.Graphics();
    circle.beginFill(isSelected ? 0xFFD700 : 0xFFFFFF); // Dorado si está seleccionado, blanco si no
    circle.lineStyle(3, 0x8B4513); // Borde marrón
    circle.drawCircle(0, 0, 25); // Círculo de 25px de radio
    circle.endFill();
    nodeContainer.addChild(circle as any);

    // Texto del nodo
    if (node.title) {
      const text = new PIXI.Text(node.title, {
        fontSize: 11,
        fill: 0x000000,
        fontWeight: 'bold',
        wordWrap: true,
        wordWrapWidth: 80,
        align: 'center'
      });
      text.anchor.set(0.5);
      text.position.set(0, -40);
      nodeContainer.addChild(text as any);
    }

    return nodeContainer;
  }

  /**
   * Dibuja un nodo conector
   */
  private drawConnectorNode(): PIXI.Container {
    // 🗺️ SPRITE DEL MAPA: Aquí se crean los nodos conectores (puntos pequeños)
    const nodeContainer = new PIXI.Container();
    
    const circle = new PIXI.Graphics();
    circle.beginFill(0x8B4513);
    circle.drawCircle(0, 0, 8);
    circle.endFill();
    nodeContainer.addChild(circle as any);

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
  private async createCharacter(): Promise<PIXI.Container> {
    const character = new PIXI.Container();
    
    try {
      // 🐝 INTENTA CARGAR: Ruta a tu sprite del jugador
      const texture = await PIXI.Assets.load('/assets/sprites/bee.png');
      const beeSprite = new PIXI.Sprite(texture);
      
      beeSprite.width = 50;
      beeSprite.height = 50;
      beeSprite.anchor.set(0.5);
      
      character.addChild(beeSprite as any);
      
      console.log('✅ Sprite del jugador cargado desde imagen');
    } catch (error) {
      console.warn('⚠️ No se pudo cargar el sprite del jugador. Usando dibujo por defecto.');
      
      // Como NO existe el prite del jugador /assets/sprites/bee.png, usa esto:
      // ═══════════════════════════════════════════════════════════════════
      // se crea con codigo el sprite de la abeja
      // ═══════════════════════════════════════════════════════════════════
      
      // Cuerpo amarillo de la abeja
      const body = new PIXI.Graphics();
      body.beginFill(0xFFD700); // Color dorado
      body.drawEllipse(0, 0, 18, 12); // Elipse para el cuerpo
      body.endFill();
      
      // Rayas negras
      body.beginFill(0x000000);
      body.drawRect(-6, -4, 3, 8); // Primera raya
      body.drawRect(3, -4, 3, 8);  // Segunda raya
      body.endFill();
      
      // Ala izquierda
      const wing1 = new PIXI.Graphics();
      wing1.beginFill(0xFFFFFF, 0.7); // Blanco semi-transparente
      wing1.drawEllipse(-10, -8, 8, 12);
      wing1.endFill();
      
      // Ala derecha
      const wing2 = new PIXI.Graphics();
      wing2.beginFill(0xFFFFFF, 0.7);
      wing2.drawEllipse(10, -8, 8, 12);
      wing2.endFill();
      
      character.addChild(wing1 as any);
      character.addChild(wing2 as any);
      character.addChild(body as any);
    }

    return character;
  }

  /**
   * Renderiza todo el mapa (solo llamar cuando cambie de mundo)
   */
  async renderMap(world: World, currentNodeId: number): Promise<void> {
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
      this.character = await this.createCharacter();
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
