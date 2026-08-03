import { motion } from 'framer-motion';

interface EnvironmentProps {
  dominantColor: string;
  bgGradient: string;
  floorColor: string;
  isActive: boolean;
}

export function Environment({ dominantColor, bgGradient, floorColor, isActive }: EnvironmentProps) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Deep space base */}
      <div className="absolute inset-0 bg-[#0a0e27]" />

      {/* Ambient gradient reacting to emotion */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: isActive ? 1 : 0.3 }}
        transition={{ duration: 1.5 }}
        style={{ background: bgGradient }}
      />

      {/* Star field */}
      <div className="absolute inset-0">
        {STARS.map((s, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
            animate={{ opacity: [0.15, 0.7, 0.15] }}
            transition={{ duration: s.dur, repeat: Infinity, delay: s.delay }}
          />
        ))}
      </div>

      {/* Distant horizon glow — center of the room */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 rounded-full blur-3xl"
        style={{
          width: '70%',
          height: '40%',
          top: '25%',
          background: `radial-gradient(ellipse, ${dominantColor}20 0%, transparent 70%)`,
        }}
        animate={{ opacity: isActive ? 0.8 : 0.3, scale: isActive ? 1.1 : 0.9 }}
        transition={{ duration: 1.5 }}
      />

      {/* Floor — perspective grid suggesting a room */}
      <div className="absolute bottom-0 left-0 right-0 h-[45%] overflow-hidden">
        {/* Floor base gradient */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${floorColor} 0%, transparent 100%)`,
            opacity: 0.3,
          }}
          animate={{ opacity: isActive ? 0.5 : 0.2 }}
          transition={{ duration: 1.2 }}
        />
        {/* Perspective lines converging to center */}
        {FLOOR_LINES.map((offset, i) => (
          <div
            key={i}
            className="absolute bottom-0 origin-bottom"
            style={{
              left: `${offset}%`,
              width: 1,
              height: '100%',
              background: `linear-gradient(to top, ${dominantColor}40, transparent)`,
              transform: `rotate(${(offset - 50) * -0.35}deg)`,
              transformOrigin: 'bottom center',
              opacity: 0.3,
            }}
          />
        ))}
        {/* Horizontal floor rings */}
        {[0.15, 0.3, 0.5, 0.75].map((h, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 -translate-x-1/2 rounded-[50%] border"
            style={{
              width: `${30 + i * 25}%`,
              height: `${4 + i * 2}%`,
              bottom: `${h * 100}%`,
              borderColor: floorColor,
            }}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
      </div>

      {/* Central floor beam — under the console */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 origin-bottom"
        style={{
          width: '45%',
          height: '55%',
          bottom: '0%',
          background: `linear-gradient(to top, ${floorColor} 0%, transparent 70%)`,
          filter: 'blur(35px)',
        }}
        animate={{ opacity: isActive ? 0.65 : 0.25 }}
        transition={{ duration: 1.2 }}
      />

      {/* Floating particles */}
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ width: p.size, height: p.size, background: dominantColor }}
          initial={{ left: `${p.x}%`, top: '100%' }}
          animate={{ top: '-5%', opacity: [0, 0.5, 0] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'linear' }}
        />
      ))}

      {/* Vignette */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 45%, transparent 35%, rgba(0,0,0,0.6) 100%)' }} />
    </div>
  );
}

const STARS = Array.from({ length: 50 }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 65,
  size: Math.random() * 2 + 1,
  dur: Math.random() * 3 + 2,
  delay: Math.random() * 3,
}));

const FLOOR_LINES = [15, 28, 40, 50, 60, 72, 85];

const PARTICLES = Array.from({ length: 15 }, () => ({
  x: Math.random() * 100,
  size: Math.random() * 4 + 2,
  dur: Math.random() * 8 + 6,
  delay: Math.random() * 10,
}));
