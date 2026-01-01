import React from 'react';
import { CanvasElement } from '../types';
import { X, Clock, PauseCircle, Trash2, Wand2, PenTool, SlidersHorizontal, Zap } from 'lucide-react';

interface PropertiesPanelProps {
  element: CanvasElement | undefined;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onClose: () => void;
  onDelete: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  element, 
  onUpdate, 
  onClose,
  onDelete
}) => {
  if (!element) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 p-6 flex flex-col items-center justify-center text-center text-gray-400">
        <p>Select an element on the canvas or timeline to edit its properties.</p>
      </div>
    );
  }

  return (
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col shadow-lg z-20">
      <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
        <h3 className="font-semibold text-gray-800">Properties</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Content Section */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">
            Content
          </label>
          {element.type === 'text' ? (
             <textarea 
               className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
               rows={3}
               value={element.content}
               onChange={(e) => onUpdate({ content: e.target.value })}
             />
          ) : (
             <div className="space-y-2">
               <div className="w-full aspect-square bg-gray-50 border border-gray-200 rounded flex items-center justify-center p-4 overflow-hidden">
                 <img 
                   src={element.content} 
                   alt="preview" 
                   className={`max-w-full max-h-full object-contain ${element.sketchMode ? 'grayscale contrast-125 brightness-110' : ''}`} 
                 />
               </div>
               <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer p-2 hover:bg-gray-50 rounded border border-gray-100">
                 <input 
                   type="checkbox" 
                   checked={element.sketchMode || false} 
                   onChange={(e) => onUpdate({ sketchMode: e.target.checked })}
                   className="rounded text-brand-600 focus:ring-brand-500"
                 />
                 <Wand2 size={14} className="text-purple-500" />
                 <span>Sketch Filter</span>
               </label>
             </div>
          )}
        </div>

        {/* Animation Timings */}
        <div className="space-y-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">
            Timing (Seconds)
          </label>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-1 text-sm text-gray-700 mb-1">
                <Clock size={14} className="text-brand-500" />
                <span>Animate</span>
              </div>
              <input 
                type="number" 
                step="0.5"
                min="0.5"
                value={element.animateDuration}
                onChange={(e) => onUpdate({ animateDuration: parseFloat(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-brand-500 text-sm"
              />
            </div>

            <div>
              <div className="flex items-center gap-1 text-sm text-gray-700 mb-1">
                <PauseCircle size={14} className="text-orange-500" />
                <span>Pause</span>
              </div>
              <input 
                type="number" 
                step="0.5"
                min="0"
                value={element.pauseDuration}
                onChange={(e) => onUpdate({ pauseDuration: parseFloat(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-brand-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Animation Style */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">
            Animation Style
          </label>
          
          <div>
            <select 
              value={element.animationType}
              onChange={(e) => onUpdate({ animationType: e.target.value as any })}
              className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
            >
              <option value="draw">Hand Draw (Sketch)</option>
              <option value="move-in">Move In</option>
              <option value="fade-in">Fade In</option>
              <option value="pop-up">Pop Up</option>
            </select>
          </div>

          {/* Advanced Sketch Settings */}
          {element.animationType === 'draw' && element.type !== 'text' && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-4">
              
              {/* Brush Type */}
              <div>
                 <div className="flex items-center gap-2 mb-1 text-xs font-medium text-gray-600">
                    <PenTool size={12} /> Brush Tool
                 </div>
                 <div className="flex bg-white rounded border border-gray-300 p-1">
                    <button 
                       onClick={() => onUpdate({ brushType: 'pencil' })}
                       className={`flex-1 py-1 text-xs rounded ${(!element.brushType || element.brushType === 'pencil') ? 'bg-brand-100 text-brand-700 font-bold' : 'text-gray-500'}`}
                    >
                      Pencil
                    </button>
                    <button 
                       onClick={() => onUpdate({ brushType: 'marker' })}
                       className={`flex-1 py-1 text-xs rounded ${(element.brushType === 'marker') ? 'bg-brand-100 text-brand-700 font-bold' : 'text-gray-500'}`}
                    >
                      Spidol
                    </button>
                 </div>
              </div>

              {/* Edge Sensitivity / Density */}
              <div>
                 <div className="flex items-center justify-between mb-1 text-xs font-medium text-gray-600">
                    <span className="flex items-center gap-2"><SlidersHorizontal size={12} /> Density</span>
                    <span className="text-[10px] text-gray-400">{element.sketchDensity || 1.0}</span>
                 </div>
                 <input 
                   type="range"
                   min="0.2"
                   max="2.5"
                   step="0.1"
                   value={element.sketchDensity || 1.0}
                   onChange={(e) => onUpdate({ sketchDensity: parseFloat(e.target.value) })}
                   className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                 />
              </div>

               {/* Jitter */}
               <div>
                 <div className="flex items-center justify-between mb-1 text-xs font-medium text-gray-600">
                    <span className="flex items-center gap-2"><Zap size={12} /> Jitter (Wobble)</span>
                    <span className="text-[10px] text-gray-400">{element.strokeJitter || 0}</span>
                 </div>
                 <input 
                   type="range"
                   min="0"
                   max="10"
                   step="1"
                   value={element.strokeJitter || 0}
                   onChange={(e) => onUpdate({ strokeJitter: parseInt(e.target.value) })}
                   className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                 />
              </div>

              {/* Opacity */}
              <div>
                 <div className="flex items-center justify-between mb-1 text-xs font-medium text-gray-600">
                    <span className="flex items-center gap-2">Brush Opacity</span>
                    <span className="text-[10px] text-gray-400">{Math.round((element.brushOpacity ?? 1) * 100)}%</span>
                 </div>
                 <input 
                   type="range"
                   min="0.1"
                   max="1.0"
                   step="0.1"
                   value={element.brushOpacity ?? 1.0}
                   onChange={(e) => onUpdate({ brushOpacity: parseFloat(e.target.value) })}
                   className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                 />
              </div>

              {/* Drawing Order */}
              <div>
                 <div className="flex items-center gap-2 mb-1 text-xs font-medium text-gray-600">
                    Drawing Order
                 </div>
                 <select 
                   value={element.drawingStrategy || 'outline-fill'}
                   onChange={(e) => onUpdate({ drawingStrategy: e.target.value as any })}
                   className="w-full p-1.5 border border-gray-300 rounded text-xs bg-white"
                 >
                   <option value="outline-fill">Outline then Fill</option>
                   <option value="scan-vertical">Vertical Scan</option>
                   <option value="diagonal">Diagonal Cross</option>
                 </select>
              </div>

            </div>
          )}

          {element.type === 'text' && (
             <div>
               <span className="text-sm text-gray-700 mb-1 block">Font</span>
               <select 
                 value={element.fontFamily || 'Handlee'}
                 onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                 className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
               >
                 <option value="Handlee">Handlee (Handwritten)</option>
                 <option value="Inter">Inter (Clean)</option>
                 <option value="Serif">Serif</option>
               </select>
             </div>
          )}
        </div>

        {/* Transform */}
        <div className="space-y-3 border-t border-gray-100 pt-4">
           <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">
              Transform
           </label>
           <div className="grid grid-cols-2 gap-2">
             <div className="text-sm">
                <label className="block text-gray-600 mb-1">Rotation</label>
                <input 
                  type="number" 
                  value={Math.round(element.rotation)}
                  onChange={(e) => onUpdate({ rotation: parseInt(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                />
             </div>
             <div className="text-sm">
                <label className="block text-gray-600 mb-1">Scale %</label>
                <input 
                  type="number" 
                  value={Math.round(element.width / 2)} // Rough proxy for scale
                  onChange={(e) => {
                     const w = parseInt(e.target.value) * 2;
                     const ratio = element.height / element.width;
                     onUpdate({ width: w, height: w * ratio });
                  }}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                />
             </div>
           </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={onDelete}
          className="w-full py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
        >
          <Trash2 size={16} /> Delete Element
        </button>
      </div>
    </div>
  );
};