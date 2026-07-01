import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight, Clock, FileText, User } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import SessionDetailDialog from '../sessions/SessionDetailDialog';
import { sessions as sessionsApi } from '@/api/apiClient';

const statusColors = {
  recording: 'bg-red-100 text-red-700',
  processing: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  draft: 'bg-slate-100 text-slate-600',
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
}

function formatDuration(secs) {
  if (!secs) return null;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function SessionsSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => sessionsApi.list(),
  });

  const filtered = sessions.filter(s => {
    const q = search.toLowerCase();
    return (
      s.title?.toLowerCase().includes(q) ||
      s.patient_name?.toLowerCase().includes(q) ||
      s.transcript?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.aside
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden"
            style={{ minWidth: 0 }}
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-700">Past Sessions</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-slate-700"
                  onClick={() => setCollapsed(true)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search sessions..."
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </div>

            {/* Session List */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400 px-4 text-center">
                  <FileText className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-xs">{search ? 'No sessions match your search.' : 'No sessions yet.'}</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filtered.map(session => (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-700 truncate leading-snug group-hover:text-teal-700">
                          {session.title || 'Untitled Session'}
                        </span>
                        <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">
                          {formatDate(session.created_date)}
                        </span>
                      </div>

                      {session.patient_name && (
                        <div className="flex items-center gap-1 mb-1.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-500 truncate">{session.patient_name}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-[10px] px-1.5 py-0 ${statusColors[session.status]}`}>
                          {session.status}
                        </Badge>
                        {session.soap_note && (
                          <span className="text-[10px] text-teal-600 font-medium">SOAP</span>
                        )}
                        {session.duration && (
                          <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                            <Clock className="w-2.5 h-2.5" />
                            {formatDuration(session.duration)}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="px-4 py-2 border-t border-slate-100">
              <p className="text-xs text-slate-400">{filtered.length} session{filtered.length !== 1 ? 's' : ''}</p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Collapsed toggle */}
      {collapsed && (
        <div className="flex-shrink-0 w-10 bg-white border-r border-slate-200 flex flex-col items-center pt-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-slate-700"
            onClick={() => setCollapsed(false)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Session detail dialog */}
      {selectedSession && (
        <SessionDetailDialog
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </>
  );
}