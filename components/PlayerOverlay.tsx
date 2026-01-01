import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, useMotionValue, animate, useAnimationFrame } from 'framer-motion';
import { CanvasElement, CanvasTexture } from '../types';
import { X, Play, Pause, SkipBack } from 'lucide-react';

interface PlayerOverlayProps {
  elements: CanvasElement[];
  isOpen: boolean;
  onClose: () => void;
  texture?: CanvasTexture;
}

export const PlayerOverlay: React.FC<PlayerOverlayProps> = ({ elements, isOpen, onClose, texture = 'paper' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'drawing' | 'pausing' | 'transitioning'>('drawing');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setPhase('drawing');
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
  }, [isOpen]);

  // Main sequencer logic
  useEffect(() => {
    if (!isPlaying || !isOpen || elements.length === 0) return;

    if (currentIndex >= elements.length) {
      setIsPlaying(false);
      return;
    }

    const currentEl = elements[currentIndex];

    const nextStep = () => {
      if (phase === 'drawing') {
        timerRef.current = setTimeout(() => {
          setPhase('pausing');
        }, currentEl.animateDuration * 1000);
      } else if (phase === 'pausing') {
        timerRef.current = setTimeout(() => {
            setPhase('transitioning');
        }, currentEl.pauseDuration * 1000);
      } else if (phase === 'transitioning') {
         timerRef.current = setTimeout(() => {
            if (currentIndex < elements.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setPhase('drawing');
            } else {
                setIsPlaying(false); // End
            }
         }, currentEl.transitionDuration * 1000);
      }
    };

    nextStep();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentIndex, phase, elements, isOpen]);

  if (!isOpen) return null;

  const currentEl = elements[currentIndex];
  
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  
  // Camera Logic
  const targetScale = currentEl 
    ? Math.min(viewportW / (currentEl.width * 1.5), viewportH / (currentEl.height * 1.5)) 
    : 1;

  const targetX = currentEl 
    ? (viewportW / 2) - (currentEl.x + currentEl.width / 2) * targetScale
    : 0;
  
  const targetY = currentEl 
    ? (viewportH / 2) - (currentEl.y + currentEl.height / 2) * targetScale
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gray-900/80 text-white rounded-full px-6 py-3 flex items-center gap-6 shadow-2xl backdrop-blur-sm z-50">
        <button onClick={() => { setCurrentIndex(0); setPhase('drawing'); setIsPlaying(true); }}>
          <SkipBack size={24} />
        </button>
        <button onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? <Pause size={32} /> : <Play size={32} />}
        </button>
        <button onClick={onClose} className="bg-white/20 rounded-full p-1 hover:bg-white/30">
          <X size={20} />
        </button>
      </div>

      {/* Canvas Viewport */}
      <div className={`flex-1 overflow-hidden relative cursor-none bg-${texture}`}>
        <motion.div
            className="absolute origin-top-left will-change-transform"
            animate={{
              x: targetX,
              y: targetY,
              scale: targetScale,
            }}
            transition={{
              duration: elements[Math.max(0, currentIndex - 1)]?.transitionDuration || 1, 
              ease: "easeInOut"
            }}
        >
          {elements.map((el, idx) => {
             const isVisible = idx <= currentIndex;
             const isActive = idx === currentIndex;
             
             return (
               <div 
                 key={el.id}
                 style={{
                   position: 'absolute',
                   left: el.x,
                   top: el.y,
                   width: el.width,
                   height: el.height,
                   transform: `rotate(${el.rotation}deg)`,
                 }}
               >
                 <AnimateElement 
                   element={el} 
                   state={idx < currentIndex ? 'done' : (isActive && isPlaying ? phase : 'waiting')}
                 />
               </div>
             );
          })}
        </motion.div>
        
        {/* Hand Cursor Overlay */}
        {isPlaying && phase === 'drawing' && currentEl && currentEl.animationType === 'draw' && (
          <HandFollower 
             element={currentEl} 
             cameraScale={targetScale}
             cameraX={targetX}
             cameraY={targetY}
          />
        )}
      </div>
    </div>
  );
};

const AnimateElement = ({ element, state }: { element: CanvasElement, state: 'waiting' | 'drawing' | 'pausing' | 'transitioning' | 'done' }) => {
  if (state === 'waiting') return null;

  const isDrawing = state === 'drawing';
  const isDone = state === 'done' || state === 'pausing' || state === 'transitioning';

  // Enhanced Sketch Filters: High contrast + Sepia for paper feel + Thresholding simulation
  const filterStyle = element.sketchMode 
    ? 'grayscale(100%) contrast(125%) brightness(110%) sepia(10%) drop-shadow(1px 1px 0px rgba(0,0,0,0.1))' 
    : '';

  // Determine Stroke properties based on Brush Type
  // Pencil = thin, sharp. Marker = thick, rounder.
  const isMarker = element.brushType === 'marker';
  const strokeWidth = isMarker ? 30 : 4; // Increased widths for better coverage
  
  // Smoothness (Line Join)
  const lineJoin = isMarker ? 'round' : 'miter';
  const lineCap = isMarker ? 'round' : 'square';

  // Text Animation
  if (element.type === 'text') {
    return (
      <div 
        className="w-full h-full flex items-center justify-center"
        style={{ fontFamily: element.fontFamily || 'Handlee', color: element.color || '#000' }}
      >
        <motion.span
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: isDrawing ? element.animateDuration : 0 }}
           className="text-4xl leading-tight whitespace-pre-wrap text-center"
           style={{ fontSize: '100%' }}
        >
          {element.content}
        </motion.span>
      </div>
    );
  }

  // Draw Animation (Scribble Reveal)
  if (element.animationType === 'draw') {
    // Pass properties to generator
    const scribblePath = useMemo(() => generateScribblePath(
      element.width, 
      element.height, 
      element.sketchDensity || 1.0,
      element.drawingStrategy || 'outline-fill'
    ), [element.width, element.height, element.sketchDensity, element.drawingStrategy]);
    
    const maskId = `mask-${element.id}`;
    const filterId = `filter-${element.id}`;
    const jitter = element.strokeJitter || 0;
    const opacity = element.brushOpacity ?? 1;

    return (
      <div className="w-full h-full relative">
         <svg width="100%" height="100%" viewBox={`0 0 ${element.width} ${element.height}`} className="absolute inset-0 pointer-events-none">
           <defs>
             {/* Jitter Filter */}
             {jitter > 0 && (
               <filter id={filterId}>
                 <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="2" result="noise" />
                 <feDisplacementMap in="SourceGraphic" in2="noise" scale={jitter * 1.5} />
               </filter>
             )}
             
             <mask id={maskId} maskUnits="userSpaceOnUse">
                {isDone ? (
                   <rect x="-10%" y="-10%" width="120%" height="120%" fill="white" />
                ) : (
                  <motion.path 
                    d={scribblePath}
                    stroke={`rgba(255,255,255, ${opacity})`}
                    strokeWidth={strokeWidth} 
                    fill="none"
                    strokeLinecap={lineCap}
                    strokeLinejoin={lineJoin}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: element.animateDuration, ease: "linear" }}
                    filter={jitter > 0 ? `url(#${filterId})` : undefined}
                  />
                )}
             </mask>
           </defs>
         </svg>

         <img 
            src={element.content}
            className="w-full h-full object-contain"
            style={{ 
               mask: `url(#${maskId})`,
               WebkitMask: `url(#${maskId})`,
               filter: filterStyle,
               // Mix blend mode multiply makes white backgrounds transparent on paper, 
               // simulating ink. But only if not transparent PNG.
               mixBlendMode: 'multiply' 
            }}
         />
      </div>
    );
  }

  // Standard Animations
  return (
    <div className="w-full h-full">
      <motion.img 
        src={element.content}
        className="w-full h-full object-contain"
        style={{ filter: filterStyle, mixBlendMode: 'multiply' }}
        initial={ 
           element.animationType === 'pop-up' ? { scale: 0, opacity: 0 } :
           element.animationType === 'move-in' ? { x: -100, opacity: 0 } :
           { opacity: 0 } 
        }
        animate={
           element.animationType === 'pop-up' ? { scale: 1, opacity: 1 } :
           element.animationType === 'move-in' ? { x: 0, opacity: 1 } :
           { opacity: 1 }
        }
        transition={{ duration: isDone ? 0 : element.animateDuration, ease: "linear" }}
      />
    </div>
  );
};

/**
 * Generates path based on strategy and density.
 */
const generateScribblePath = (
  width: number, 
  height: number, 
  density: number = 1.0, 
  strategy: 'outline-fill' | 'scan-vertical' | 'diagonal' = 'outline-fill'
) => {
  // Density controls step size. Higher density = smaller step (more lines).
  const baseStep = 30; // Base step size
  const step = Math.max(8, baseStep / density); 
  
  let d = `M 0 0`;
  
  if (strategy === 'outline-fill') {
    // 1. Outline (Double loop for coverage)
    d += ` L ${width} 0 L ${width} ${height} L 0 ${height} L 0 0`;
    d += ` L ${width} 0 L ${width} ${height} L 0 ${height} L 0 0`;
    
    // 2. Horizontal Zigzag Fill
    // We overscan slightly (-step to width+step) to catch edges
    let y = step / 2;
    while (y < height) {
      // Right sweep
      d += ` L ${width + 10} ${Math.min(y, height)}`;
      y += step;
      if (y > height + step) break;
      // Left sweep
      d += ` L ${-10} ${Math.min(y, height)}`;
      y += step;
    }

  } else if (strategy === 'scan-vertical') {
    // Vertical scan: Top to bottom zigzag
    let y = 0;
    while (y <= height + step) {
      d += ` M 0 ${y} L ${width} ${y}`;
      y += step;
      d += ` M ${width} ${y} L 0 ${y}`; // Backwards for hand travel
      y += step;
    }
    
  } else if (strategy === 'diagonal') {
     // Diagonal Zigzag (Cross hatch simulation)
     let x = 0;
     let y = 0;
     const diagStep = step * 1.2;
     
     // First pass: Top-Left to Bottom-Right
     // Iterate through the perimeter essentially to create diagonals
     const maxDim = width + height;
     for (let i = 0; i < maxDim; i += diagStep) {
        // Start point (either on top edge or left edge)
        let startX = i < width ? i : width;
        let startY = i < width ? 0 : i - width;
        
        // End point (either on right edge or bottom edge)
        // We want 45 degree lines: y = x + c
        // Drawing lines like / 
        d += ` M ${0} ${i} L ${i} ${0}`;
        // Add a return stroke to simulate continuous hand movement if needed, 
        // or just jump (M) for cleaner fill, but continuous (L) looks more like sketching
        if (i + diagStep < maxDim) {
           let nextI = i + diagStep;
           d += ` L ${nextI} 0 L 0 ${nextI}`;
           i += diagStep; // Skip increment since we handled it
        }
     }
  }
  
  return d;
};

// Hand Follower using real SVG path geometry for precision
const HandFollower = ({ element, cameraScale, cameraX, cameraY }: { element: CanvasElement, cameraScale: number, cameraX: number, cameraY: number }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const progress = useMotionValue(0);
  
  const d = useMemo(() => generateScribblePath(
      element.width, 
      element.height, 
      element.sketchDensity || 1.0,
      element.drawingStrategy || 'outline-fill'
  ), [element.width, element.height, element.sketchDensity, element.drawingStrategy]);

  // Measure path length once mounted
  useEffect(() => {
    if (pathRef.current) {
        setPathLength(pathRef.current.getTotalLength());
    }
  }, [d]);

  // Animate progress 0 -> 1
  useEffect(() => {
    if (!pathLength) return;
    // Note: We use useMotionValue for smooth updates in useAnimationFrame
    const controls = animate(progress, 1, { duration: element.animateDuration, ease: "linear" });
    return () => controls.stop();
  }, [pathLength, element.animateDuration, progress]);

  // Update hand position every frame based on progress along the path
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  useAnimationFrame(() => {
      if (!pathRef.current || pathLength === 0) return;
      const val = progress.get(); // 0 to 1
      // Get point at current length
      const point = pathRef.current.getPointAtLength(val * pathLength);
      
      // Transform to screen space
      x.set(point.x * cameraScale + cameraX);
      y.set(point.y * cameraScale + cameraY);
  });

  return (
    <>
      {/* Invisible path for calculation */}
      <svg width={0} height={0} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
         <path d={d} ref={pathRef} />
      </svg>

      <motion.div
         className="fixed pointer-events-none z-50 drop-shadow-2xl"
         style={{ x, y }}
      >
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Hand_cursor_icon.svg/1024px-Hand_cursor_icon.svg.png" 
          alt="Hand"
          className="w-64 h-64 -ml-8 -mt-8 rotate-12 filter drop-shadow-lg"
        />
      </motion.div>
    </>
  );
}