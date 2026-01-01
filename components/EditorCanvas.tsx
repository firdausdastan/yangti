import React, { useRef } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { CanvasElement, CanvasTexture } from '../types';

interface EditorCanvasProps {
  elements: CanvasElement[];
  selectedId: string | null;
  zoom: number;
  texture: CanvasTexture;
  onSelect: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({ 
  elements, 
  selectedId, 
  zoom, 
  texture,
  onSelect, 
  onUpdateElement 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 16:9 Base Resolution
  const CANVAS_WIDTH = 1280;
  const CANVAS_HEIGHT = 720; 

  const handleBgClick = (e: React.MouseEvent) => {
    // Deselect if clicking the gray background or the empty parts of the canvas paper
    if (e.target === containerRef.current || e.currentTarget === e.target) {
      onSelect(null);
    }
  };

  return (
    <div 
      className="flex-1 bg-gray-200 overflow-hidden relative cursor-grab active:cursor-grabbing flex items-center justify-center"
      onClick={handleBgClick}
    >
      <div className="relative" style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
        {/* The 16:9 Sheet */}
        <div 
          ref={containerRef}
          className={`shadow-2xl relative overflow-hidden border border-gray-300 bg-${texture}`}
          style={{ 
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
          }}
          onClick={(e) => {
             if(e.target === e.currentTarget) onSelect(null);
          }}
        >
          {/* Safe Zone Grid (Optional visual aid, hidden by default) */}
          <div className="absolute inset-0 pointer-events-none opacity-5">
             <div className="w-full h-full grid grid-cols-4 grid-rows-4">
                {[...Array(16)].map((_, i) => <div key={i} className="border border-black"></div>)}
             </div>
          </div>

          {elements.map((el) => (
            <DraggableElement 
              key={el.id} 
              element={el} 
              isSelected={selectedId === el.id}
              onSelect={() => onSelect(el.id)}
              onUpdate={(u) => onUpdateElement(el.id, u)}
            />
          ))}
        </div>

        {/* Resolution Label */}
        <div className="absolute -top-6 left-0 text-xs text-gray-500 font-medium">
           1280 x 720 (16:9)
        </div>
      </div>
    </div>
  );
};

const DraggableElement = ({ 
  element, 
  isSelected, 
  onSelect, 
  onUpdate 
}: { 
  element: CanvasElement, 
  isSelected: boolean, 
  onSelect: () => void,
  onUpdate: (u: Partial<CanvasElement>) => void
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const controls = useDragControls();

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragEnd={(_, info) => {
        onUpdate({ 
          x: element.x + info.offset.x, 
          y: element.y + info.offset.y 
        });
      }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      style={{
        position: 'absolute',
        left: 0, 
        top: 0,
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        rotate: element.rotation,
        zIndex: isSelected ? 10 : 1
      }}
      className={`group ${isSelected ? 'ring-2 ring-brand-500 ring-offset-2' : 'hover:ring-1 hover:ring-gray-300'}`}
    >
       {/* Resize Handles */}
       {isSelected && (
         <>
           <div className="absolute -top-3 -left-3 w-3 h-3 bg-white border border-brand-500 rounded-full"></div>
           <div className="absolute -top-3 -right-3 w-3 h-3 bg-white border border-brand-500 rounded-full"></div>
           <div className="absolute -bottom-3 -left-3 w-3 h-3 bg-white border border-brand-500 rounded-full"></div>
           <motion.div 
             className="absolute -bottom-3 -right-3 w-3 h-3 bg-brand-500 border border-white rounded-full cursor-nwse-resize"
             drag
             dragMomentum={false}
             onDrag={(_, info) => {
                // Prevent bubbling
             }}
             onDragEnd={(_, info) => {
                const newWidth = Math.max(50, element.width + info.offset.x);
                const ratio = element.height / element.width;
                onUpdate({ width: newWidth, height: newWidth * ratio });
             }}
           />
         </>
       )}

       {/* Content Renderer */}
       {element.type === 'text' ? (
         <div 
           className="w-full h-full flex items-center justify-center text-center p-2 select-none"
           style={{ 
             fontFamily: element.fontFamily || 'Handlee', 
             fontSize: `${Math.max(12, element.width / 5)}px`,
             color: element.color || 'black'
           }}
         >
           {element.content}
         </div>
       ) : (
         <img 
           src={element.content} 
           alt="el" 
           className={`w-full h-full object-contain pointer-events-none select-none ${element.sketchMode ? 'grayscale contrast-125 brightness-110' : ''}`}
           draggable={false}
         />
       )}
    </motion.div>
  );
};