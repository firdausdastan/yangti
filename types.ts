export type CanvasTexture = 'paper' | 'blueprint' | 'whiteboard';

export interface CanvasElement {
  id: string;
  type: 'image' | 'text' | 'shape';
  content: string; // URL for image, text content for text
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  animateDuration: number; // Seconds to draw/animate
  pauseDuration: number; // Seconds to wait after animation
  transitionDuration: number; // Seconds to move to next
  animationType: 'draw' | 'move-in' | 'fade-in' | 'pop-up';
  fontFamily?: string;
  color?: string;
  sketchMode?: boolean; // New property for sketch effect
  
  // Sketch Specific Settings
  brushType?: 'pencil' | 'marker';
  sketchDensity?: number; // 0.5 (loose) to 3.0 (dense/sensitive)
  drawingStrategy?: 'outline-fill' | 'scan-vertical' | 'diagonal'; 
  
  // Advanced Sketch Controls
  brushOpacity?: number; // 0.1 to 1.0 (Controls how solid the reveal is)
  strokeJitter?: number; // 0 to 10 (Controls line wobbliness/roughness)
}

export interface ProjectState {
  elements: CanvasElement[];
  selectedId: string | null;
  canvasZoom: number;
  canvasPan: { x: number; y: number };
  isPlaying: boolean;
  audioUrl?: string;
}

export enum ToolType {
  SELECT = 'SELECT',
  HAND = 'HAND',
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
}