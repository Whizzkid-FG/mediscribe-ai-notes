import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  FileText, 
  Play, 
  Trash2,
  Calendar,
  User,
  Share2,
  History,
  Paperclip
} from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
  recording: 'bg-red-100 text-red-700',
  processing: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  draft: 'bg-slate-100 text-slate-700'
};

const visitTypeLabels = {
  initial: 'Initial Visit',
  follow_up: 'Follow-up',
  urgent: 'Urgent',
  routine: 'Routine',
  telehealth: 'Telehealth'
};

export default function SessionCard({ session, onOpen, onDelete, onShare, onViewHistory }) {
  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all cursor-pointer group"
      onClick={() => onOpen(session)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-teal-600 transition-colors">
            {session.title || 'Untitled Session'}
          </h3>
          {session.patient_name && (
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <User className="w-3.5 h-3.5" />
              {session.patient_name}
            </div>
          )}
        </div>
        <Badge className={statusColors[session.status]}>
          {session.status}
        </Badge>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {format(new Date(session.created_date), 'MMM d, yyyy')}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {formatDuration(session.duration)}
        </div>
        {session.visit_type && (
          <Badge variant="outline" className="text-xs">
            {visitTypeLabels[session.visit_type]}
          </Badge>
        )}
      </div>

      {session.transcript && (
        <p className="text-sm text-slate-600 line-clamp-2 mb-4">
          {session.transcript.substring(0, 150)}...
        </p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {session.soap_note && (
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <FileText className="w-3.5 h-3.5" />
              SOAP Note
            </div>
          )}
          {session.audio_url && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <Play className="w-3.5 h-3.5" />
              Audio
            </div>
          )}
          {session.uploaded_files && session.uploaded_files.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-purple-600">
              <Paperclip className="w-3.5 h-3.5" />
              {session.uploaded_files.length}
            </div>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-slate-400 hover:text-blue-600"
            onClick={(e) => {
              e.stopPropagation();
              onViewHistory?.(session);
            }}
          >
            <History className="w-4 h-4" />
          </Button>
          {onShare && (
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-slate-400 hover:text-teal-600"
              onClick={(e) => {
                e.stopPropagation();
                onShare(session);
              }}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-slate-400 hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(session.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}