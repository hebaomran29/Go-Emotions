import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { Environment } from '@/components/Environment';
import { Character } from '@/components/Character';
import { MemoryOrb } from '@/components/MemoryOrb';
import { Console } from '@/components/Console';
import { EMOTIONS, EMOTION_ORDER, analyzeEmotion } from '@/data/emotions';
import type { EmotionName, PredictionResult } from '@/types/emotion';

// Natural, asymmetric character placements — NOT a grid.
// Each character has a unique position, scale, and depth (zIndex).
// Characters stay in place; the winner steps forward via scale + z-index.
const PLACEMENTS: Record<EmotionName, { left: number; bottom: number; scale: number; z: number }> = {
  Joy:       { left: 15,  bottom: 58, scale: 0.72, z: 5  },
  Sadness:    { left: 82,  bottom: 62, scale: 0.68, z: 5  },
  Anger:      { left: 8,   bottom: 30, scale: 0.88, z: 15 },
  Fear:       { left: 90,  bottom: 28, scale: 0.82, z: 15 },
  Disgust:    { left: 26,  bottom: 8,  scale: 1.0,  z: 25 },
  Surprise:   { left: 73,  bottom: 10, scale: 0.95, z: 25 },
};

export default function App() {
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [hovered, setHovered] = useState<EmotionName | null>(null);
  const [analyzed, setAnalyzed] = useState(false);

  const dominant = result?.dominant ?? 'Joy';
  const activeEmotion = analyzed ? dominant : hovered;
  const emotionConfig = activeEmotion ? EMOTIONS[activeEmotion] : EMOTIONS.Joy;

  const handleAnalyze = useCallback(async () => {
    if (!text.trim() || analyzing) return;
    setAnalyzing(true);
    setAnalyzed(false);
    try {
      const res = await analyzeEmotion(text);
      setResult(res);
      setAnalyzed(true);
    } catch {
      // Reset on error so the UI doesn't stay stuck in loading state
    } finally {
      setAnalyzing(false);
    }
  }, [text, analyzing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const isInteractive = analyzed || hovered !== null;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0e27] text-white select-none">
      <Environment
        dominantColor={emotionConfig.color}
        bgGradient={emotionConfig.bgGradient}
        floorColor={emotionConfig.floorColor}
        isActive={analyzed}
      />

      {/* Title */}
      <div className="absolute top-0 left-0 right-0 z-40 flex justify-center pt-4 pointer-events-none">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2"
        >
          <Brain size={18} style={{ color: emotionConfig.color }} />
          <h1 className="text-sm font-bold tracking-[0.3em] uppercase" style={{ color: emotionConfig.lightColor }}>
            Emotion Headquarters
          </h1>
        </motion.div>
      </div>

      {/* Characters — naturally placed, winner steps FORWARD (higher z-index, stays in place) */}
      <div className="absolute inset-0 pointer-events-none">
        {EMOTION_ORDER.map((name) => {
          const cfg = EMOTIONS[name];
          const placement = PLACEMENTS[name];
          const isActive = activeEmotion === name;
          const isDimmed = isInteractive && activeEmotion !== name;

          // Winner gets z-index 50 — ABOVE the console (z-30).
          // Character stays in its natural position; only scales up and comes forward.
          const targetZ = isActive ? 50 : placement.z;

          return (
            <motion.div
              key={name}
              className="absolute pointer-events-auto"
              initial={false}
              animate={{
                left: `${placement.left}%`,
                bottom: `${placement.bottom}%`,
                zIndex: targetZ,
                x: '-50%',
              }}
              transition={{ type: 'spring', stiffness: 120, damping: 22 }}
              style={{ transform: 'translateX(-50%)' }}
            >
              <Character
                emotion={name}
                active={isActive}
                dimmed={isDimmed}
                baseScale={placement.scale}
                color={cfg.color}
                glowColor={cfg.glowColor}
                lightColor={cfg.lightColor}
                onHover={() => !analyzed && setHovered(name)}
                onLeave={() => !analyzed && setHovered(null)}
              />
              {/* Name label */}
              <motion.div
                className="mt-1 px-2 py-0.5 rounded-full text-[8px] font-bold tracking-wider uppercase whitespace-nowrap"
                animate={{
                  background: isActive ? `${cfg.color}25` : 'rgba(255,255,255,0.04)',
                  color: isActive ? cfg.color : 'rgba(255,255,255,0.25)',
                }}
                style={{ border: '1px solid', borderColor: isActive ? `${cfg.color}60` : 'transparent' }}
              >
                {cfg.label}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Memory orb — appears near winning character */}
      <MemoryOrb
        color={emotionConfig.color}
        glowColor={emotionConfig.glowColor}
        visible={analyzed}
        label={emotionConfig.label}
        left={PLACEMENTS[dominant]?.left ?? 50}
        bottom={(PLACEMENTS[dominant]?.bottom ?? 50) + 22}
      />

      {/* Central console — z-30, BELOW the winning character (z-50) */}
      <div className="absolute left-1/2 z-30" style={{ top: '38%', transform: 'translate(-50%, -50%)' }}>
        <Console
          text={text}
          setText={setText}
          onKeyDown={handleKeyDown}
          onAnalyze={handleAnalyze}
          analyzing={analyzing}
          analyzed={analyzed}
          emotionConfig={emotionConfig}
          dominant={dominant}
          scores={result?.scores ?? []}
          attentionWords={result?.attentionWords ?? []}
          model={result?.model ?? 'BiLSTM + Attention'}
        />
      </div>
    </div>
  );
}
