import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserPlus, X } from 'lucide-react';

export default function ShareSessionDialog({ open, onClose, session }) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const queryClient = useQueryClient();

  const { data: shares = [] } = useQuery({
    queryKey: ['session-shares', session?.id],
    queryFn: () => {
      // TODO: Implement get shared sessions API endpoint
      return Promise.resolve([]);
    },
    enabled: !!session,
  });

  const shareMutation = useMutation({
    mutationFn: async (data) => {
      // TODO: Implement share session API endpoint
      return Promise.resolve({});
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['session-shares']);
      toast.success('Session shared successfully');
      setEmail('');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (shareId) => {
      // TODO: Implement remove share API endpoint
      return Promise.resolve({});
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['session-shares']);
      toast.success('Access removed');
    },
  });

  const handleShare = () => {
    if (!email || !session) return;
    shareMutation.mutate({
      session_id: session.id,
      shared_with_email: email,
      permission,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Session</DialogTitle>
          <DialogDescription>
            Give other practitioners access to this session
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input
              type="email"
              placeholder="practitioner@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Permission</Label>
            <Select value={permission} onValueChange={setPermission}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View only</SelectItem>
                <SelectItem value="edit">Can edit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleShare}
            disabled={!email || shareMutation.isPending}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Share Session
          </Button>

          {shares.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Shared with</h4>
              <div className="space-y-2">
                {shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">{share.shared_with_email}</p>
                      <p className="text-xs text-slate-500">
                        {share.permission === 'edit' ? 'Can edit' : 'View only'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMutation.mutate(share.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}