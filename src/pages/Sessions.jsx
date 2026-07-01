import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Search, 
  Filter, 
  FolderOpen,
  Stethoscope,
  Plus,
  Loader2,
  Users
} from 'lucide-react';
import { toast } from "sonner";

import SessionCard from '../components/sessions/SessionCard';
import EmptyState from '../components/common/EmptyState';
import ShareSessionDialog from '../components/sessions/ShareSessionDialog';
import VersionHistoryDialog from '../components/sessions/VersionHistoryDialog';
import SessionDetailDialog from '../components/sessions/SessionDetailDialog';
import { sessions as sessionsApi } from '../api/apiClient';

export default function Sessions() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSession, setSelectedSession] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [shareDialogSession, setShareDialogSession] = useState(null);
  const [versionDialogSession, setVersionDialogSession] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => Promise.resolve(null) // TODO: Implement get user API
  });

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => sessionsApi.list(),
  });

  const { data: sharedData, isLoading: sharedLoading } = useQuery({
    queryKey: ['shared-sessions'],
    queryFn: async () => [],
  });
  const sharedSessions = sharedData || [];

  const deleteMutation = useMutation({
    mutationFn: (id) => sessionsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session deleted');
      setDeleteId(null);
    }
  });

  const filterSessions = (list) => list.filter(session => {
    const matchesSearch = 
      session.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.transcript?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredSessions = filterSessions(sessions);
  const filteredShared = filterSessions(sharedSessions);

  const renderGrid = (list, loading, emptyMsg, isShared = false) => {
    if (loading) return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
    if (list.length === 0) return (
      <EmptyState
        icon={isShared ? Users : FolderOpen}
        title={isShared ? "No shared sessions" : "No sessions found"}
        description={isShared
          ? "Sessions shared with you by other practitioners will appear here"
          : searchQuery || statusFilter !== 'all'
            ? "Try adjusting your search or filters"
            : "Start a new recording to create your first session"
        }
        action={!isShared && !searchQuery && statusFilter === 'all' ? "Start Recording" : null}
        onAction={() => window.location.href = createPageUrl('Dashboard')}
      />
    );
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {list.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onOpen={setSelectedSession}
              onDelete={isShared ? null : setDeleteId}
              onShare={isShared ? null : setShareDialogSession}
              onViewHistory={setVersionDialogSession}
            />
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-800">Sessions</h1>
                <p className="text-xs text-slate-500">Your saved transcriptions</p>
              </div>
            </div>
            <Link to={createPageUrl('Dashboard')}>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Plus className="w-4 h-4 mr-2" />
                New Session
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sessions..."
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="mine">
          <TabsList className="mb-6">
            <TabsTrigger value="mine" className="gap-2">
              My Sessions
              {sessions.length > 0 && (
                <Badge variant="secondary" className="text-xs h-5 px-1.5">{sessions.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="shared" className="gap-2">
              Shared with Me
              {sharedSessions.length > 0 && (
                <Badge variant="secondary" className="text-xs h-5 px-1.5">{sharedSessions.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mine">
            {renderGrid(filteredSessions, isLoading, 'my')}
          </TabsContent>

          <TabsContent value="shared">
            {renderGrid(filteredShared, sharedLoading, 'shared', true)}
          </TabsContent>
        </Tabs>
      </div>

      {/* Session Detail Dialog */}
      <SessionDetailDialog
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
        readOnly={!!selectedSession?._share && selectedSession._share.permission === 'view'}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The session and all associated data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ShareSessionDialog
        open={!!shareDialogSession}
        onClose={() => setShareDialogSession(null)}
        session={shareDialogSession}
      />

      <VersionHistoryDialog
        open={!!versionDialogSession}
        onClose={() => setVersionDialogSession(null)}
        session={versionDialogSession}
      />
    </div>
  );
}