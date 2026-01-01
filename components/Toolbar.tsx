import React from 'react';
import { 
  Type, 
  Image as ImageIcon, 
  Play, 
  Download, 
  Wand2, 
  ZoomIn,
  ZoomOut,
  Palette
} from 'lucide-react';
import { ToolType, CanvasTexture } from '../types';

interface ToolbarProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  onAddText: () => void;
  onAddImage: (src: string, width?: number, height?: number) => void;
  onPlay: () => void;
  onAiAssist: () => void;
  zoom: number;
  setZoom: (z: number) => void;
  texture: CanvasTexture;
  setTexture: (t: CanvasTexture) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  activeTool, 
  setActiveTool, 
  onAddText, 
  onAddImage, 
  onPlay,
  onAiAssist,
  zoom,
  setZoom,
  texture,
  setTexture
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (result) {
          const img = new Image();
          img.src = result;
          img.onload = () => {
            const maxDim = 300;
            let w = img.width;
            let h = img.height;
            
            if (w > h) {
              if (w > maxDim) {
                h = h * (maxDim / w);
                w = maxDim;
              }
            } else {
              if (h > maxDim) {
                w = w * (maxDim / h);
                h = maxDim;
              }
            }
            onAddImage(result, w, h);
          };
        }
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  const btnClass = (isActive: boolean) => 
    `p-2 rounded-lg transition-colors flex flex-col items-center gap-1 text-xs font-medium ${
      isActive 
        ? 'bg-brand-100 text-brand-600' 
        : 'hover:bg-gray-100 text-gray-600'
    }`;

  return (
    <div className="h-16 border-b border-gray-200 bg-white flex items-center px-4 justify-between shadow-sm z-20 relative">
      <div className="flex items-center gap-2">
        <div className="text-xl font-bold text-brand-600 mr-4 flex items-center gap-2">
          <span className="bg-brand-600 text-white p-1 rounded">VS</span>
          <span className="hidden md:inline">Clone</span>
        </div>

        <div className="h-8 w-px bg-gray-200 mx-2"></div>

        <button 
          className={btnClass(false)}
          onClick={onAiAssist}
        >
          <Wand2 size={20} />
          <span>AI Script</span>
        </button>

        <div className="h-8 w-px bg-gray-200 mx-2"></div>

        <button 
          className={btnClass(false)}
          onClick={handleUploadClick}
        >
          <ImageIcon size={20} />
          <span>Image</span>
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />

        <button 
          className={btnClass(false)}
          onClick={onAddText}
        >
          <Type size={20} />
          <span>Text</span>
        </button>

        <div className="h-8 w-px bg-gray-200 mx-2"></div>

        {/* Texture Selector */}
        <div className="flex flex-col items-center">
           <div className="flex items-center gap-1 bg-gray-50 rounded p-1 border border-gray-200">
             <Palette size={14} className="text-gray-500" />
             <select 
               value={texture} 
               onChange={(e) => setTexture(e.target.value as CanvasTexture)}
               className="bg-transparent text-xs font-medium text-gray-700 focus:outline-none cursor-pointer"
             >
               <option value="paper">Paper</option>
               <option value="whiteboard">Whiteboard</option>
               <option value="blueprint">Blueprint</option>
             </select>
           </div>
           <span className="text-[10px] text-gray-400 mt-0.5">Background</span>
        </div>

      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
           <button onClick={() => setZoom(Math.max(0.2, zoom - 0.1))} className="p-1 hover:bg-gray-200 rounded">
             <ZoomOut size={16} />
           </button>
           <span className="w-12 text-center text-xs text-gray-500">{Math.round(zoom * 100)}%</span>
           <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="p-1 hover:bg-gray-200 rounded">
             <ZoomIn size={16} />
           </button>
        </div>

        <button 
          className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-full font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          onClick={onPlay}
        >
          <Play size={18} fill="currentColor" />
          Preview
        </button>
        
        <button className="text-gray-400 hover:text-gray-600">
          <Download size={20} />
        </button>
      </div>
    </div>
  );
};