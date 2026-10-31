import React, { useState } from 'react';
import { motion } from 'motion/react';
import { playTactileClick } from '../utils/audioFeedback';
import { triggerHaptic } from '../utils/haptics';

export default function AnimatedButton({
  children,
  onClick,
  className = '',
  clickType = 'click', // 'click' | 'heavy'
  variant = 'default', // 'default' | 'primary' | 'danger' | 'dpad' | 'pill'
  active = false,
  title = '',
  disabled = false,
  'aria-label': ariaLabel
}) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = (e) => {
    if (disabled) return;
    playTactileClick(clickType);
    triggerHaptic(clickType === 'heavy' ? 35 : 20);
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 200);
    if (onClick) onClick(e);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-b from-cyan-500 to-blue-600 text-slate-950 font-black shadow-lg shadow-cyan-500/25 border-cyan-400/50';
      case 'danger':
        return 'bg-gradient-to-b from-rose-500 to-red-700 text-white font-black shadow-lg shadow-rose-600/30 border-rose-400/50';
      case 'pill':
        return 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700/80 shadow-inner';
      case 'dpad':
        return 'bg-gradient-to-b from-slate-800 to-slate-950 text-slate-300 hover:text-cyan-400 border-slate-700/60 shadow-[0_4px_12px_rgba(0,0,0,0.5)]';
      default:
        return 'bg-gradient-to-b from-slate-800/90 to-slate-900/90 hover:from-slate-750 hover:to-slate-850 text-slate-200 border-slate-700/70 shadow-md shadow-black/40';
    }
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.03, y: disabled ? 0 : -1 }}
      whileTap={{ scale: disabled ? 1 : 0.91 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      onClick={handleClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel || title}
      className={`relative overflow-hidden border select-none transition-colors duration-150 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${getVariantStyles()} ${
        active || isPressed ? 'ring-2 ring-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.4)]' : ''
      } ${className}`}
    >
      {/* Specular Light Sweep Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none opacity-60" />

      {/* Click Wave Pulse */}
      {isPressed && (
        <motion.div
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full bg-cyan-400/40 pointer-events-none"
        />
      )}

      {/* Button Content */}
      <span className="relative z-10 flex items-center justify-center gap-1.5 pointer-events-none">
        {children}
      </span>
    </motion.button>
  );
}
