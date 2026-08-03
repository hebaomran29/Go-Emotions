import { motion } from 'framer-motion';
import type { EmotionName } from '@/types/emotion';

interface CharacterProps {
  emotion: EmotionName;
  active: boolean;
  dimmed: boolean;
  baseScale: number;
  color: string;
  glowColor: string;
  lightColor: string;
  onHover: () => void;
  onLeave: () => void;
}

const CHARACTER_IMAGES: Record<EmotionName, string> = {
  Joy: '/characters/joy.png',
  Sadness: '/characters/sadness.png',
  Anger: '/characters/anger.png',
  Fear: '/characters/fear.png',
  Disgust: '/characters/disgust.png',
  Surprise: '/characters/anxiety.png',
};

// Gentle, personality-driven idle bobbing — soft and natural
const IDLE_ANIMATIONS: Record<EmotionName, object> = {
  Joy: { y: [0, -6, 0], rotate: [0, 2, 0] },
  Sadness: { y: [0, 3, 0] },
  Anger: { x: [0, -1.5, 1.5, 0] },
  Fear: { y: [0, -2, 0], rotate: [0, -1.5, 0] },
  Disgust: { rotate: [0, -1.5, 0] },
  Surprise: { y: [0, -4, 0] },
};

const IDLE_DURATIONS: Record<EmotionName, number> = {
  Joy: 2.5,
  Sadness: 4.5,
  Anger: 1.8,
  Fear: 2,
  Disgust: 3.5,
  Surprise: 1.5,
};

// When active, a slightly more expressive reaction — but still gentle
const ACTIVE_ANIMATIONS: Record<EmotionName, object> = {
  Joy: { y: [0, -12, 0], rotate: [0, 4, -4, 0] },
  Sadness: { y: [0, 5, 0], rotate: [0, -2, 0] },
  Anger: { x: [0, -2, 2, 0], scale: [1, 1.04, 1] },
  Fear: { y: [0, -4, 0], x: [0, -1, 1, 0] },
  Disgust: { rotate: [0, -4, 0], y: [0, -3, 0] },
  Surprise: { y: [0, -10, 0], scale: [1, 1.06, 1] },
};

const ACTIVE_DURATIONS: Record<EmotionName, number> = {
  Joy: 1.2,
  Sadness: 3,
  Anger: 0.6,
  Fear: 0.8,
  Disgust: 1.8,
  Surprise: 0.7,
};

export function Character({ emotion, active, dimmed, baseScale, color, glowColor, lightColor, onHover, onLeave }: CharacterProps) {
  const scale = active ? 1.6 : dimmed ? 0.78 : baseScale;

  return (
    <motion.div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      animate={{
        scale,
        opacity: dimmed ? 0.35 : 1,
        filter: active
          ? `drop-shadow(0 0 20px ${glowColor}90) drop-shadow(0 0 40px ${color}50) brightness(1.12)`
          : dimmed
          ? 'brightness(0.55) saturate(0.5)'
          : 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))',
      }}
      transition={{ type: 'spring', stiffness: 140, damping: 18 }}
      className="relative flex flex-col items-center cursor-pointer"
      style={{ width: 120 }}
    >
      {/* Soft glow halo behind active character */}
      {active && (
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
          style={{
            width: 140,
            height: 140,
            background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
          }}
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Soft floor glow */}
      {active && (
        <motion.div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 h-3 rounded-full blur-md z-0"
          style={{ background: color }}
          animate={{ opacity: [0.3, 0.6, 0.3], scaleX: [0.85, 1, 0.85] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <motion.img
        src={CHARACTER_IMAGES[emotion]}
        alt={emotion}
        className="relative z-10 object-contain pointer-events-none"
        style={{
          height: 185,
          width: 'auto',
          maxWidth: 135,
        }}
        animate={active ? ACTIVE_ANIMATIONS[emotion] : IDLE_ANIMATIONS[emotion]}
        transition={{
          duration: active ? ACTIVE_DURATIONS[emotion] : IDLE_DURATIONS[emotion],
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
}
