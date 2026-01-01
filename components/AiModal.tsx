import React, { useState } from 'react';
import { X, Wand2, Loader2, Check } from 'lucide-react';
import { generateScript, generateSceneIdeas } from '../services/geminiService';

interface AiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (scenes: Array<{ text: string, visualDescription: string }>) => void;
}

export const AiModal: React.FC<AiModalProps> = ({ isOpen, onClose, onApply }) => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'generating' | 'preview'>('input');
  const [script, setScript] = useState('');
  const [scenes, setScenes] = useState<Array<{ text: string, visualDescription: string }>>([]);

  const handleGenerate = async () => {
    if (!topic) return;
    setStep('generating');
    setLoading(true);

    const generatedScript = await generateScript(topic);
    setScript(generatedScript);
    
    const generatedScenes = await generateSceneIdeas(generatedScript);
    setScenes(generatedScenes);

    setLoading(false);
    setStep('preview');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-brand-50">
          <h2 className="text-lg font-bold text-brand-900 flex items-center gap-2">
            <Wand2 size={20} className="text-brand-600" /> AI Storyboarder
          </h2>
          <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
        </div>

        <div className="p-6 overflow-y-auto">
          {step === 'input' && (
            <div className="space-y-4">
              <p className="text-gray-600 text-sm">
                Enter a topic, and Gemini will write a script and suggest visual scenes for your animation.
              </p>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                rows={4}
                placeholder="e.g., Explain the water cycle to 5th graders..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <button 
                onClick={handleGenerate}
                disabled={!topic.trim()}
                className="w-full bg-brand-600 text-white py-3 rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                Generate Story <Wand2 size={16} />
              </button>
            </div>
          )}

          {step === 'generating' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <Loader2 size={48} className="animate-spin text-brand-500" />
              <div>
                <p className="font-medium text-gray-800">Dreaming up your story...</p>
                <p className="text-sm text-gray-500">Asking Gemini for ideas.</p>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Generated Script</h3>
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 max-h-32 overflow-y-auto italic border border-gray-200">
                  "{script}"
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Proposed Scenes ({scenes.length})</h3>
                <div className="space-y-2">
                  {scenes.map((scene, idx) => (
                    <div key={idx} className="flex gap-3 p-2 border border-gray-100 rounded hover:bg-gray-50">
                      <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="text-sm">
                        <p className="font-semibold text-gray-800">"{scene.text}"</p>
                        <p className="text-gray-500 text-xs">Visual: {scene.visualDescription}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => { onApply(scenes); onClose(); }}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 flex justify-center items-center gap-2"
              >
                <Check size={18} /> Create Project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};