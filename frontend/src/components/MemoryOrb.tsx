import { motion } from 'framer-motion';

interface MemoryOrbProps {
  color: string;
  glowColor: string;
  visible: boolean;
  label: string;
  left: number;
  bottom: number;
}

export function MemoryOrb({ color, glowColor, visible, label, left, bottom }: MemoryOrbProps) {
  if (!visible) return null;
  return (
    <motion.div
      initial={{ y: 40, opacity: 0, scale: 0.3 }}
      animate={{ y: [-15, -45, -15], opacity: [0, 1, 0.9], scale: 1 }}
      transition={{ duration: 0.8, y: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
      className="absolute z-30 flex flex-col items-center pointer-events-none"
      style={{ left: `${left}%`, bottom: `${bottom}%`, transform: 'translateX(-50%)' }}
    >
      <motion.div
        className="relative rounded-full"
        style={{
          width: 50,
          height: 50,
          background: `radial-gradient(circle at 35% 30%, white 0%, ${color} 40%, ${glowColor} 100%)`,
          boxShadow: `0 0 25px ${glowColor}, 0 0 50px ${color}80`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-2 rounded-full opacity-30" style={{ background: `radial-gradient(circle at 60% 70%, ${color} 0%, transparent 60%)` }} />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-1.5 text-[10px] font-semibold tracking-wide uppercase whitespace-nowrap"
        style={{ color: glowColor, textShadow: `0 0 8px ${glowColor}` }}
      >
        {label}
      </motion.p>
    </motion.div>
  );
}
