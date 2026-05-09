import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Mic, Square, Pause, Play, RotateCcw } from 'lucide-react';

export default function RecordingControls({ 
  isRecording, 
  isPaused,
  duration,
  onStart, 
  onStop, 
  onPause,
  onResume,
  onReset 
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center gap-4 py-6">
      {!isRecording ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-shadow"
        >
          <Mic className="w-8 h-8" />
        </motion.button>
      ) : (
        <>
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full"
            onClick={onReset}
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isPaused ? onResume : onPause}
            className="w-16 h-16 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center"
          >
            {isPaused ? <Play className="w-6 h-6 ml-1" /> : <Pause className="w-6 h-6" />}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStop}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30"
          >
            <Square className="w-7 h-7 fill-current" />
          </motion.button>
        </>
      )}
      
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <span className="text-2xl font-mono font-light text-slate-600 tracking-wider">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}