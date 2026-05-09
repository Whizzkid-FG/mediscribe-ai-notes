import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Copy, 
  Download, 
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { toast } from "sonner";

const sections = [
  { key: 'subjective', label: 'Subjective', color: 'bg-blue-500' },
  { key: 'objective', label: 'Objective', color: 'bg-emerald-500' },
  { key: 'assessment', label: 'Assessment', color: 'bg-amber-500' },
  { key: 'plan', label: 'Plan', color: 'bg-purple-500' },
];

export default function SOAPNoteEditor({ 
  soapNote, 
  onUpdate, 
  onGenerate, 
  isGenerating,
  hasTranscript 
}) {
  const [expandedSections, setExpandedSections] = useState(
    sections.reduce((acc, s) => ({ ...acc, [s.key]: true }), {})
  );
  const [note, setNote] = useState(soapNote || {
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  });

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    const updated = { ...note, [key]: value };
    setNote(updated);
    onUpdate?.(updated);
  };

  const copyToClipboard = () => {
    const text = sections
      .map(s => `${s.label.toUpperCase()}\n${note[s.key] || 'N/A'}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    toast.success('SOAP note copied to clipboard');
  };

  const downloadNote = () => {
    const text = sections
      .map(s => `${s.label.toUpperCase()}\n${'='.repeat(20)}\n${note[s.key] || 'N/A'}`)
      .join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soap-note-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800">SOAP Note</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="text-xs"
          >
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadNote}
            className="text-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export
          </Button>
          <Button
            size="sm"
            onClick={onGenerate}
            disabled={isGenerating || !hasTranscript}
            className="bg-gradient-to-r from-teal-500 to-teal-600 text-white text-xs"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            )}
            Generate
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sections.map((section) => (
          <motion.div
            key={section.key}
            className="border border-slate-200 rounded-xl overflow-hidden bg-white"
            layout
          >
            <button
              onClick={() => toggleSection(section.key)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-1.5 h-8 rounded-full ${section.color}`} />
                <span className="font-medium text-slate-700">{section.label}</span>
                {note[section.key] && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
              </div>
              {expandedSections[section.key] ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
            
            {expandedSections[section.key] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 pb-4"
              >
                <Textarea
                  value={note[section.key]}
                  onChange={(e) => handleChange(section.key, e.target.value)}
                  placeholder={`Enter ${section.label.toLowerCase()} findings...`}
                  className="min-h-[120px] resize-none border-slate-200 focus:border-teal-500 focus:ring-teal-500/20"
                />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}