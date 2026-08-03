import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import type { AttentionWord, EmotionScore, EmotionConfig, EmotionName } from '@/types/emotion';

interface ConsoleProps {
  text: string;
  setText: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onAnalyze: () => void;
  analyzing: boolean;
  analyzed: boolean;
  emotionConfig: EmotionConfig;
  dominant: EmotionName;
  scores: EmotionScore[];
  attentionWords: AttentionWord[];
  model: string;
}

const SCORE_COLORS: Record<EmotionName, string> = {
  Joy: '#ffd60a',
  Sadness: '#3b82f6',
  Anger: '#ef4444',
  Fear: '#a855f7',
  Disgust: '#22c55e',
  Surprise: '#f97316',
};

export function Console({
  text, setText, onKeyDown, onAnalyze, analyzing, analyzed,
  emotionConfig, dominant, scores, attentionWords, model,
}: ConsoleProps) {
  const dominantScore = scores.find((s) => s.name === dominant)?.score ?? 0;
  const accent = analyzed ? emotionConfig.color : '#a78bfa';
  const accentGlow = analyzed ? emotionConfig.glowColor : '#c4b5fd';

  return (
    <div className="relative w-full max-w-lg">
      {/* Soft warm glow behind console */}
      <motion.div
        className="absolute -inset-6 rounded-[2.5rem] blur-2xl pointer-events-none"
        animate={{ opacity: analyzed ? [0.35, 0.55, 0.35] : 0.2 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: `radial-gradient(ellipse at center, ${accent}30 0%, transparent 70%)` }}
      />

      {/* Main console — soft, rounded, translucent, organic */}
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 90, damping: 16 }}
        className="relative rounded-[2rem] backdrop-blur-xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.06) 100%)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: `0 8px 40px rgba(0,0,0,0.25), 0 0 30px ${accent}25, inset 0 1px 0 rgba(255,255,255,0.15)`,
        }}
      >
        {/* Soft top sheen */}
        <div className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none rounded-t-[2rem]"
          style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.06), transparent)' }} />

        <div className="relative p-6 pt-6">
          {/* Header — whimsical, not technical */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <motion.div
                className="flex items-center justify-center rounded-full"
                style={{ width: 28, height: 28, background: `${accent}25` }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles size={14} style={{ color: accent }} />
              </motion.div>
              <span className="text-[10px] font-semibold tracking-[0.15em] text-white/50">
                {analyzing ? 'Reading feelings…' : analyzed ? 'Emotion detected' : 'How are they feeling?'}
              </span>
            </div>
            <span className="text-[8px] uppercase tracking-widest text-white/25 font-medium">{model}</span>
          </div>

          {/* Input — soft, rounded, friendly */}
          <div className="flex items-center gap-2.5">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type a sentence for the emotions to read…"
              className="flex-1 bg-white/80 rounded-2xl px-4 py-3 text-sm text-black placeholder:text-black/40 focus:outline-none transition-all font-medium"
              style={{
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: analyzed ? `inset 0 0 20px ${accent}15` : 'inset 0 1px 0 rgba(255,255,255,0.05)',
              }}
            />
            <motion.button
              onClick={onAnalyze}
              disabled={analyzing || !text.trim()}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className="flex items-center gap-1.5 px-5 py-3 rounded-2xl font-bold text-xs tracking-wide transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accentGlow})`,
                color: '#fff',
                boxShadow: `0 4px 20px ${accent}50, inset 0 1px 0 rgba(255,255,255,0.3)`,
              }}
            >
              <Wand2 size={14} />
              Feel
            </motion.button>
          </div>

          {/* Results area — grows inside the console organically */}
          <div className="relative min-h-[70px] mt-3">
            <AnimatePresence mode="wait">
              {analyzing && (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-5 gap-2"
                >
                  <Loader2 size={14} className="animate-spin" style={{ color: accent }} />
                  <span className="text-[10px] tracking-[0.15em] text-white/45">Sensing emotions…</span>
                </motion.div>
              )}

              {analyzed && !analyzing && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Emotion name — soft, warm, emotional */}
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 180 }}
                      className="flex items-center gap-2"
                    >
                      <span
                        className="text-2xl font-black tracking-tight"
                        style={{ color: emotionConfig.color, textShadow: `0 0 18px ${emotionConfig.glowColor}` }}
                      >
                        {emotionConfig.label}
                      </span>
                      <span
                        className="text-lg font-bold"
                        style={{ color: emotionConfig.lightColor, textShadow: `0 0 12px ${emotionConfig.glowColor}` }}
                      >
                        {dominantScore}%
                      </span>
                    </motion.div>
                  </div>

                  {/* Soft confidence pills — compact, organic */}
                  <div className="flex items-center justify-center gap-1.5 mb-3">
                    {scores.map((s) => {
                      const isDom = s.name === dominant;
                      const c = SCORE_COLORS[s.name];
                      return (
                        <motion.div
                          key={s.name}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.15 + scores.indexOf(s) * 0.05 }}
                          className="flex flex-col items-center gap-1"
                        >
                          <div className="relative h-10 w-2 rounded-full bg-white/8 overflow-hidden">
                            <motion.div
                              className="absolute bottom-0 left-0 right-0 rounded-full"
                              style={{ background: c, boxShadow: isDom ? `0 0 8px ${c}90` : 'none' }}
                              initial={{ height: 0 }}
                              animate={{ height: `${s.score}%` }}
                              transition={{ duration: 0.7, delay: 0.2, type: 'spring' }}
                            />
                          </div>
                          <span
                            className="text-[7px] font-bold tracking-wider"
                            style={{ color: isDom ? c : 'rgba(255,255,255,0.3)' }}
                          >
                            {s.name.slice(0, 3).toUpperCase()}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Attention words — gentle highlight, dreamy */}
                  {attentionWords.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 }}
                      className="text-center pt-2.5"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <p className="text-[8px] tracking-[0.15em] text-white/30 mb-2 font-medium">What the emotions noticed</p>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {attentionWords.map((w, i) => (
                          <motion.span
                            key={`${w.word}-${i}`}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.35 + i * 0.04 }}
                            className="px-2 py-0.5 rounded-full font-medium"
                            style={{
                              color: w.weight > 0.6 ? emotionConfig.lightColor : 'rgba(255,255,255,0.55)',
                              background: `${emotionConfig.color}${Math.round(w.weight * 160).toString(16).padStart(2, '0')}`,
                              fontSize: `${0.72 + w.weight * 0.38}rem`,
                              textShadow: w.weight > 0.6 ? `0 0 8px ${emotionConfig.glowColor}` : 'none',
                              fontWeight: w.weight > 0.5 ? 700 : 500,
                            }}
                          >
                            {w.word}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {!analyzed && !analyzing && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-3"
                >
                  <span className="text-[10px] text-white/20 tracking-[0.15em]">
                    The emotions are listening…
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Soft bottom dots — gentle, not mechanical */}
        <div className="flex justify-center gap-2 pb-4">
          {(['Joy', 'Sadness', 'Anger', 'Fear', 'Disgust', 'Surprise'] as EmotionName[]).map((name) => {
            const lit = analyzed && dominant === name;
            const c = SCORE_COLORS[name];
            return (
              <motion.div
                key={name}
                className="w-1.5 h-1.5 rounded-full"
                animate={{
                  background: lit ? c : 'rgba(255,255,255,0.10)',
                  boxShadow: lit ? `0 0 8px ${c}` : 'none',
                  scale: lit ? [1, 1.5, 1] : 1,
                }}
                transition={{ duration: 1.5, repeat: lit ? Infinity : 0, ease: 'easeInOut' }}
              />
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
