import React from 'react';
import { CanvasElement } from '../types';
import { Clock, GripVertical, Trash2 } from 'lucide-react';

interface TimelineProps {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ 
  elements, 
  selectedId, 
  onSelect,
  onDelete
}) => {
  // Simplification: No complex drag-and-drop reordering implementation in this single block for stability,
  // but the structure supports mapping.

  return (
    <div className="h-40 bg-white border-t border-gray-200 flex flex-col z-20 relative">
      <div className="h-8 bg-gray-50 border-b border-gray-200 px-4 flex items-center text-xs text-gray-500 justify-between">
        <span>Timeline ({elements.length} items)</span>
        <span>Total Duration: {elements.reduce((acc, el) => acc + el.animateDuration + el.pauseDuration + el.transitionDuration, 0).toFixed(1)}s</span>
      </div>
      
      <div className="flex-1 overflow-x-auto p-4 flex gap-4 items-center">
        {elements.length === 0 && (
          <div className="w-full text-center text-gray-400 italic">
            Add elements to the canvas to start your story...
          </div>
        )}
        
        {elements.map((el, index) => (
          <div 
            key={el.id}
            className={`
              relative flex-shrink-0 w-32 h-24 bg-white border-2 rounded-lg cursor-pointer group transition-all
              ${selectedId === el.id ? 'border-brand-500 shadow-md scale-105' : 'border-gray-200 hover:border-gray-300'}
            `}
            onClick={() => onSelect(el.id)}
          >
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-bold z-10">
              {index + 1}
            </div>
            
            <div className="w-full h-full flex items-center justify-center p-2 overflow-hidden bg-gray-50 rounded-md">
              {el.type === 'text' ? (
                <span className="text-xs text-gray-800 font-hand truncate px-1 text-center select-none">
                  {el.content}
                </span>
              ) : (
                <img src={el.content} alt="element" className="max-w-full max-h-full object-contain pointer-events-none" />
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 flex justify-between items-center backdrop-blur-sm rounded-b-md opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="flex items-center gap-1">
                <Clock size={10} /> {el.animateDuration}s
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(el.id); }}
                className="hover:text-red-300"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}

        {/* Placeholder for adding at end */}
        <div className="w-4 flex-shrink-0"></div>
      </div>
    </div>
  );
};