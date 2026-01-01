import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Toolbar } from './components/Toolbar';
import { Timeline } from './components/Timeline';
import { PropertiesPanel } from './components/PropertiesPanel';
import { EditorCanvas } from './components/EditorCanvas';
import { PlayerOverlay } from './components/PlayerOverlay';
import { AiModal } from './components/AiModal';
import { CanvasElement, ToolType, CanvasTexture } from './types';

// Predefined images for the demo since we don't have a real asset library connected
const DEMO_ASSETS = [
  'https://cdn-icons-png.flaticon.com/512/2275/2275038.png', // Idea/Bulb
  'https://cdn-icons-png.flaticon.com/512/3063/3063823.png', // Rocket
  'https://cdn-icons-png.flaticon.com/512/1995/1995515.png', // Laptop
  'https://cdn-icons-png.flaticon.com/512/3209/3209995.png', // Chart
];

export default function App() {
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.SELECT);
  const [zoom, setZoom] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [texture, setTexture] = useState<CanvasTexture>('paper');

  // --- Actions ---

  const addElement = (partial: Partial<CanvasElement>) => {
    // Basic auto-layout: place next to previous one or center
    const lastEl = elements[elements.length - 1];
    const newX = lastEl ? lastEl.x + lastEl.width + 50 : 100;
    const newY = lastEl ? lastEl.y : 100;

    const newEl: CanvasElement = {
      id: uuidv4(),
      type: partial.type || 'image',
      content: partial.content || '',
      x: newX,
      y: newY,
      width: 200,
      height: 200,
      rotation: 0,
      animateDuration: 2.0,
      pauseDuration: 0.5,
      transitionDuration: 1.0,
      animationType: 'draw',
      ...partial
    };
    
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const handleUpdateElement = (id: string, updates: Partial<CanvasElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const handleDeleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleAiApply = (scenes: Array<{ text: string, visualDescription: string }>) => {
    // Convert AI scenes to canvas elements
    const newElements: CanvasElement[] = [];
    let currentX = 100;
    let currentY = 100;

    scenes.forEach((scene, idx) => {
      // Add Text
      const textEl: CanvasElement = {
        id: uuidv4(),
        type: 'text',
        content: scene.text,
        x: currentX,
        y: currentY,
        width: 300,
        height: 100,
        rotation: 0,
        animateDuration: 1.5,
        pauseDuration: 0.5,
        transitionDuration: 1.0,
        animationType: 'draw',
        fontFamily: 'Handlee'
      };
      newElements.push(textEl);
      
      // Add Image Placeholder next to it
      // Select a random demo asset to simulate the "Visual Description" match
      const randomImg = DEMO_ASSETS[idx % DEMO_ASSETS.length];
      const imgEl: CanvasElement = {
        id: uuidv4(),
        type: 'image',
        content: randomImg,
        x: currentX + 350,
        y: currentY,
        width: 200,
        height: 200,
        rotation: (Math.random() * 10) - 5,
        animateDuration: 3.0,
        pauseDuration: 1.0,
        transitionDuration: 1.5,
        animationType: 'draw'
      };
      newElements.push(imgEl);

      // Advance layout
      currentX += 600;
      if (idx % 2 !== 0) {
          currentX = 100;
          currentY += 400;
      }
    });

    setElements(prev => [...prev, ...newElements]);
  };

  const selectedElement = elements.find(el => el.id === selectedId);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden font-sans text-gray-900">
      
      <Toolbar 
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        onAddText={() => addElement({ type: 'text', content: 'New Text', height: 100, width: 300 })}
        onAddImage={(src, width, height) => addElement({ 
          type: 'image', 
          content: src,
          width: width,
          height: height
        })}
        onPlay={() => setIsPlaying(true)}
        onAiAssist={() => setShowAiModal(true)}
        zoom={zoom}
        setZoom={setZoom}
        texture={texture}
        setTexture={setTexture}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left or Top Canvas Area */}
        <EditorCanvas 
          elements={elements}
          selectedId={selectedId}
          zoom={zoom}
          texture={texture}
          onSelect={setSelectedId}
          onUpdateElement={handleUpdateElement}
        />

        {/* Right Properties Panel (only if selected) */}
        {selectedId && (
          <PropertiesPanel 
            element={selectedElement}
            onUpdate={(u) => handleUpdateElement(selectedId, u)}
            onClose={() => setSelectedId(null)}
            onDelete={() => handleDeleteElement(selectedId)}
          />
        )}
      </div>

      <Timeline 
        elements={elements}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onDelete={handleDeleteElement}
        onReorder={() => {}} // Placeholder
      />

      <PlayerOverlay 
        elements={elements}
        isOpen={isPlaying}
        onClose={() => setIsPlaying(false)}
        texture={texture}
      />

      <AiModal 
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onApply={handleAiApply}
      />
    </div>
  );
}