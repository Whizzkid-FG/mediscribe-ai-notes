import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function VersionHistoryDialog({ open, onClose, session }) {
  const queryClient = useQueryClient();

  const { data: versions = [] } = useQuery({
    queryKey: ['session-versions', session?.id],
    queryFn: () => {
      // TODO: Implement get session versions API endpoint
      return Promise.resolve([]);
    },
    enabled: !!session,
  });

  const restoreMutation = useMutation({
    mutationFn: async (version) => {
      // TODO: Implement restore version API endpoint
      return Promise.resolve({});
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sessions']);
      queryClient.invalidateQueries(['session-versions']);
      toast.success('Version restored successfully');
      onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            View and restore previous versions of this session
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {versions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No version history available</p>
            </div>
          ) : (
            versions.map((version) => (
              <div
                key={version.id}
                className="p-4 border border-slate-200 rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">
                        Version {version.version_number}
                      </span>
                      {version.version_number === session.current_version && (
                        <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {format(new Date(version.created_date), 'MMM d, yyyy h:mm a')}
                    </p>
                    {version.edited_by_email && (
                      <p className="text-xs text-slate-600 mt-1">
                        By: {version.edited_by_email}
                      </p>
                    )}
                    {version.change_description && (
                      <p className="text-xs text-slate-600 mt-1">
                        {version.change_description}
                      </p>
                    )}
                  </div>
                  {version.version_number !== session.current_version && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => restoreMutation.mutate(version)}
                      disabled={restoreMutation.isPending}
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Restore
                    </Button>
                  )}
                </div>

                {version.transcript && (
                  <div className="text-xs">
                    <p className="font-medium text-slate-700 mb-1">Transcript:</p>
                    <p className="text-slate-600 line-clamp-2">{version.transcript}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}