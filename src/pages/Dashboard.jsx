import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Mic, 
  FileText, 
  Clock, 
  Plus,
  Save,
  X,
  User,
  Stethoscope
} from 'lucide-react';
import { toast } from "sonner";

import AudioWaveform from '../components/transcription/AudioWaveform';
import TranscriptionDisplay from '../components/transcription/TranscriptionDisplay';
import RecordingControls from '../components/transcription/RecordingControls';
import SOAPNoteEditor from '../components/soap/SOAPNoteEditor';
import WelcomeGuide from '../components/dashboard/WelcomeGuide';
import FileUploadZone from '../components/sessions/FileUploadZone';
import SessionsSidebar from '../components/dashboard/SessionsSidebar';
import { sessions as sessionsApi } from '../api/apiClient';

export default function Dashboard() {
  const queryClient = useQueryClient();
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Refs to avoid stale closures in recognition callbacks
  const isRecordingRef = useRef(false);
  const isPausedRef = useRef(false);
  
  // Session metadata
  const [sessionTitle, setSessionTitle] = useState('');
  const [patientName, setPatientName] = useState('');
  const [visitType, setVisitType] = useState('routine');
  const [soapNote, setSoapNote] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // Show welcome guide on first visit
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('medscribe_welcome_seen');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
      localStorage.setItem('medscribe_welcome_seen', 'true');
    }
  }, []);
  
  // Refs
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Load settings
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      // TODO: Implement settings API endpoint
      return null;
    }
  });

  // Mutations
  const saveSessionMutation = useMutation({
    mutationFn: (data) => sessionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session saved successfully');
      resetSession();
      setShowSaveDialog(false);
    },
    onError: () => {
      toast.error('Failed to save session');
    }
  });

  // Timer effect
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording, isPaused]);

  // Audio level animation
  useEffect(() => {
    let animationFrame;
    const updateAudioLevel = () => {
      if (analyserRef.current && isRecording && !isPaused) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);
      }
      animationFrame = requestAnimationFrame(updateAudioLevel);
    };
    
    if (isRecording && !isPaused) {
      updateAudioLevel();
    }
    
    return () => cancelAnimationFrame(animationFrame);
  }, [isRecording, isPaused]);

  const startRecording = async () => {
    try {
      // Check if browser supports required APIs
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error('Your browser does not support audio recording. Please use Chrome, Edge, or Safari.');
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast.error('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
        return;
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      // Setup audio analysis
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      // Setup speech recognition for live transcription
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = settings?.language || 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalText = '';
        let interimText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript + ' ';
          } else {
            interimText += result[0].transcript;
          }
        }

        if (finalText) {
          setTranscript(prev => prev + finalText.trim() + '\n');
          setInterimTranscript('');
        }
        if (interimText) {
          setInterimTranscript(interimText);
        }
      };

      recognitionRef.current.onerror = (event) => {
        if (event.error !== 'no-speech') {
          toast.error('Speech recognition error: ' + event.error);
        }
      };

      // Use refs to avoid stale closure — auto-restart after each phrase
      // Small delay prevents "already started" InvalidStateError
      recognitionRef.current.onend = () => {
        if (isRecordingRef.current && !isPausedRef.current) {
          setTimeout(() => {
            if (isRecordingRef.current && !isPausedRef.current) {
              try {
                recognitionRef.current?.start();
              } catch (e) {
                // Already started or being restarted, ignore
              }
            }
          }, 100);
        }
      };

      recognitionRef.current.start();
      
      isRecordingRef.current = true;
      isPausedRef.current = false;
      setIsRecording(true);
      setIsPaused(false);
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        toast.error('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No microphone found. Please connect a microphone and try again.');
      } else if (error.name === 'NotReadableError') {
        toast.error('Microphone is in use by another application. Please close other apps and try again.');
      } else {
        toast.error('Could not access microphone: ' + error.message);
      }
    }
  };

  const stopRecording = async () => {
    isRecordingRef.current = false;
    isPausedRef.current = false;
    recognitionRef.current?.stop();
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    audioContextRef.current?.close();

    setIsRecording(false);
    setIsPaused(false);
    setInterimTranscript('');

    if (!transcript.trim()) {
      toast.error('No transcript available');
      return;
    }

    // Auto-generate SOAP note if enabled
    if (settings?.auto_generate_soap) {
      setIsGenerating(true);
      try {
        toast.info('SOAP generation coming soon');
        // TODO: Implement SOAP generation API endpoint
        setShowSaveDialog(true);
      } catch (error) {
        console.error('SOAP generation error:', error);
        toast.error('Failed to generate SOAP note: ' + error.message);
      } finally {
        setIsGenerating(false);
      }
    } else {
      setShowSaveDialog(true);
    }
  };

  const pauseRecording = () => {
    isPausedRef.current = true;
    recognitionRef.current?.stop();
    setIsPaused(true);
    setInterimTranscript('');
  };

  const resumeRecording = () => {
    isPausedRef.current = false;
    setIsPaused(false);
    try {
      recognitionRef.current?.start();
    } catch (e) {
      // Ignore if already started
    }
  };

  const resetSession = () => {
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    setTranscript('');
    setInterimTranscript('');
    setSoapNote(null);
    setSessionTitle('');
    setPatientName('');
    setVisitType('routine');
    setUploadedFiles([]);
    setAudioLevel(0);
    recognitionRef.current?.stop();
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
  };

  const generateSOAPNote = async () => {
    if (!transcript.trim()) {
      toast.error('No transcript available');
      return;
    }
    
    setIsGenerating(true);
    try {
      // TODO: Implement SOAP generation API endpoint
      toast.info('SOAP generation coming soon');
    } catch (error) {
      console.error('Error generating SOAP note:', error);
      toast.error('Failed to generate SOAP note: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSession = async () => {
    saveSessionMutation.mutate({
      title: sessionTitle || 'Untitled Session',
      patientName,
      visitType,
      transcript,
      soapNote: typeof soapNote === 'string'
        ? soapNote
        : soapNote
          ? `SUBJECTIVE:\n${soapNote.subjective || ''}\n\nOBJECTIVE:\n${soapNote.objective || ''}\n\nASSESSMENT:\n${soapNote.assessment || ''}\n\nPLAN:\n${soapNote.plan || ''}`
          : '',
      duration,
      status: 'completed',
      uploadedFiles,
    });
  };

  const handleSaveLater = () => {
    setShowSaveDialog(false);
    // Keep transcript and SOAP data so user can generate SOAP note
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10 flex-shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-800">MedScribe</h1>
                <p className="text-xs text-slate-500">Real-time Medical Transcription</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isRecording && (
                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                  {isPaused ? 'Paused' : 'Recording'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Body: Sidebar + Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sessions Sidebar */}
        <div className="hidden lg:flex h-[calc(100vh-65px)] sticky top-[65px]">
          <SessionsSidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Left Panel - Transcription */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-160px)]">
              {/* Waveform */}
              <div className="border-b border-slate-100 bg-slate-50/50">
                <AudioWaveform isRecording={isRecording && !isPaused} audioLevel={audioLevel} />
              </div>
              
              {/* Transcript */}
              <div className="flex-1 min-h-0">
                <TranscriptionDisplay 
                  transcript={transcript}
                  interimTranscript={interimTranscript}
                  isLive={isRecording && !isPaused}
                />
              </div>
              
              {/* Controls */}
              <div className="border-t border-slate-100 bg-slate-50/50 relative">
                <RecordingControls
                  isRecording={isRecording}
                  isPaused={isPaused}
                  duration={duration}
                  onStart={startRecording}
                  onStop={stopRecording}
                  onPause={pauseRecording}
                  onResume={resumeRecording}
                  onReset={resetSession}
                />
              </div>
            </div>

            {/* Right Panel - SOAP Note */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden h-[calc(100vh-160px)]">
              <SOAPNoteEditor
                soapNote={soapNote}
                onUpdate={setSoapNote}
                onGenerate={generateSOAPNote}
                isGenerating={isGenerating}
                hasTranscript={transcript.trim().length > 0}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Session Title
              </label>
              <Input
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="e.g., Follow-up Visit - John Doe"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Patient Name
              </label>
              <Input
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Patient name"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Visit Type
              </label>
              <Select value={visitType} onValueChange={setVisitType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="initial">Initial Visit</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="telehealth">Telehealth</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                Attach Files (optional)
              </label>
              <FileUploadZone 
                files={uploadedFiles}
                onFilesChange={setUploadedFiles}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleSaveLater}>
              Save Later
            </Button>
            <Button 
              onClick={handleSaveSession}
              disabled={saveSessionMutation.isPending}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Welcome Guide */}
      <WelcomeGuide open={showWelcome} onClose={() => setShowWelcome(false)} />
    </div>
  );
}