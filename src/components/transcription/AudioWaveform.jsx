import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function AudioWaveform({ isRecording, audioLevel = 0 }) {
  const bars = 32;
  
  return (
    <div className="flex items-center justify-center gap-0.5 h-16 px-4">
      {Array.from({ length: bars }).map((_, i) => {
        const baseHeight = Math.sin((i / bars) * Math.PI) * 0.5 + 0.3;
        const animatedHeight = isRecording 
          ? baseHeight * (0.3 + Math.random() * audioLevel * 0.7)
          : baseHeight * 0.2;
        
        return (
          <motion.div
            key={i}
            className={`w-1 rounded-full ${isRecording ? 'bg-teal-500' : 'bg-slate-300'}`}
            animate={{
              height: `${animatedHeight * 100}%`,
            }}
            transition={{
              duration: 0.1,
              ease: "easeOut"
            }}
          />
        );
      })}
    </div>
  );
}