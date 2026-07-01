import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pencil, Save, X, FileText, Download, Loader2, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { sessions as sessionsApi } from '@/api/apiClient';

const statusColors = {
  recording: 'bg-red-100 text-red-700',
  processing: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  draft: 'bg-slate-100 text-slate-700'
};

export default function SessionDetailDialog({ session, onClose, readOnly = false }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [soapNote, setSoapNote] = useState('');

  useEffect(() => {
    if (session) {
      setTranscript(session.transcript || '');
      setSoapNote(session.soap_note || '');
      setEditing(false);
    }
  }, [session?.id]);

  const saveMutation = useMutation({
    mutationFn: async () => sessionsApi.update(session.id, {
      title: session.title,
      patientName: session.patient_name,
      visitType: session.visit_type,
      transcript,
      soapNote,
      duration: session.duration,
      status: session.status,
      uploadedFiles: session.uploaded_files,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session updated');
      setEditing(false);
    },
  });

  if (!session) return null;

  return (
    <Dialog open={!!session} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 pr-6">
            <div>
              <DialogTitle className="text-xl mb-1">{session.title || 'Untitled Session'}</DialogTitle>
              <p className="text-xs text-slate-500">
                {format(new Date(session.created_date), 'MMMM d, yyyy · h:mm a')}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge className={statusColors[session.status]}>{session.status}</Badge>
              {!readOnly && !editing && (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>
              )}
              {editing && (
                <>
                  <Button
                    size="sm"
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setTranscript(session.transcript || ''); setSoapNote(session.soap_note || ''); }}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Meta */}
          <div className="flex flex-wrap gap-2">
            {session.patient_name && <Badge variant="outline">{session.patient_name}</Badge>}
            {session.visit_type && <Badge variant="outline">{session.visit_type.replace('_', ' ')}</Badge>}
            {session._share && (
              <Badge variant="secondary">
                Shared with you · {session._share.permission === 'edit' ? 'Can edit' : 'View only'}
              </Badge>
            )}
          </div>

          {/* Transcript */}
          <div>
            <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> Transcript
            </h4>
            {editing ? (
              <Textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="min-h-[160px] text-sm"
              />
            ) : (
              <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {transcript || <span className="text-slate-400 italic">No transcript</span>}
              </div>
            )}
          </div>

          {/* SOAP Note */}
          <div>
            <h4 className="font-medium text-slate-700 mb-2">SOAP Note</h4>
            {editing ? (
              <Textarea
                value={soapNote}
                onChange={(e) => setSoapNote(e.target.value)}
                className="min-h-[160px] text-sm"
              />
            ) : (
              <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {soapNote || <span className="text-slate-400 italic">No SOAP note</span>}
              </div>
            )}
          </div>

          {/* Attached Files */}
          {session.uploaded_files && session.uploaded_files.length > 0 && (
            <div>
              <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-1.5">
                <Paperclip className="w-4 h-4" /> Attachments ({session.uploaded_files.length})
              </h4>
              <div className="space-y-2">
                {session.uploaded_files.map((file, i) => (
                  <a
                    key={i}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors group"
                  >
                    <FileText className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span className="text-sm text-slate-700 flex-1 truncate">{file.name}</span>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-teal-600 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}