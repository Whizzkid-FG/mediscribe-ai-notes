import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, User } from 'lucide-react';

export default function TranscriptionDisplay({ transcript, interimTranscript = '', isLive = false }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, interimTranscript]);

  const lines = transcript?.split('\n').filter(Boolean) || [];

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto px-6 py-4 space-y-3"
    >
      {lines.length === 0 && !interimTranscript && (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <Mic className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm">Transcript will appear here...</p>
        </div>
      )}

      <AnimatePresence>
        {lines.map((line, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <User className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex-1 bg-slate-50 rounded-2xl rounded-tl-sm px-4 py-3">
              <p className="text-slate-700 text-sm leading-relaxed">{line}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Interim (in-progress) text shown live as user speaks */}
      {interimTranscript && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-3"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
            <User className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex-1 bg-teal-50/60 border border-teal-100 rounded-2xl rounded-tl-sm px-4 py-3">
            <p className="text-slate-500 text-sm leading-relaxed italic">{interimTranscript}</p>
          </div>
        </motion.div>
      )}

      {isLive && (
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex items-center gap-2 text-teal-600 text-sm pl-11"
        >
          <span className="w-2 h-2 rounded-full bg-teal-500" />
          Listening...
        </motion.div>
      )}
    </div>
  );
}