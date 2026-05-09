import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Stethoscope,
  Settings as SettingsIcon,
  Mic,
  Brain,
  Save,
  Loader2,
  Globe,
  LogOut
} from 'lucide-react';
import { toast } from "sonner";

const transcriptionModels = [
  { value: 'whisper-large-v3', label: 'Whisper Large V3 (Best Quality)' },
  { value: 'whisper-medium', label: 'Whisper Medium (Balanced)' },
  { value: 'whisper-small', label: 'Whisper Small (Fastest)' },
  { value: 'browser', label: 'Browser Built-in' },
];

const llmModels = [
  { value: 'llama3.2', label: 'Llama 3.2 (Recommended)' },
  { value: 'llama3.1', label: 'Llama 3.1' },
  { value: 'mistral', label: 'Mistral' },
  { value: 'gemma2', label: 'Gemma 2' },
];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'zh', label: 'Chinese' },
];

export default function Settings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({
    transcription_model: 'browser',
    llm_model: 'llama3.2',
    auto_generate_soap: true,
    auto_save_audio: true,
    auto_enhance_transcript: false,
    language: 'en'
  });

  const { data: savedSettings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      // TODO: Implement load settings API endpoint
      return null;
    }
  });

  useEffect(() => {
    if (savedSettings) {
      setSettings({
        transcription_model: savedSettings.transcription_model || 'browser',
        llm_model: savedSettings.llm_model || 'llama3.2',
        auto_generate_soap: savedSettings.auto_generate_soap ?? true,
        auto_save_audio: savedSettings.auto_save_audio ?? true,
        auto_enhance_transcript: savedSettings.auto_enhance_transcript ?? false,
        language: savedSettings.language || 'en'
      });
    }
  }, [savedSettings]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      // TODO: Implement save settings API endpoint
      return Promise.resolve({});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings saved');
    }
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  const handleLogout = () => {
    toast.success('Signing out...');
    logout(true); // true = redirect
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
                <h1 className="text-xl font-semibold text-slate-800">Settings</h1>
                <p className="text-xs text-slate-500">Configure your preferences</p>
              </div>
            </div>
            
            <Button 
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Transcription Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Transcription</CardTitle>
                  <CardDescription>Speech recognition settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Transcription Model
                </Label>
                <Select 
                  value={settings.transcription_model} 
                  onValueChange={(v) => setSettings({ ...settings, transcription_model: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {transcriptionModels.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-1.5">
                  Browser built-in uses your device's native speech recognition
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Language
                </Label>
                <Select 
                  value={settings.language} 
                  onValueChange={(v) => setSettings({ ...settings, language: v })}
                >
                  <SelectTrigger>
                    <Globe className="w-4 h-4 mr-2 text-slate-400" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(l => (
                      <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Auto-save Audio</Label>
                  <p className="text-xs text-slate-500">Save audio recordings with sessions</p>
                </div>
                <Switch
                  checked={settings.auto_save_audio}
                  onCheckedChange={(v) => setSettings({ ...settings, auto_save_audio: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Auto-enhance with Whisper</Label>
                  <p className="text-xs text-slate-500">Improve accuracy after recording (requires API key)</p>
                </div>
                <Switch
                  checked={settings.auto_enhance_transcript}
                  onCheckedChange={(v) => setSettings({ ...settings, auto_enhance_transcript: v })}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>AI Generation</CardTitle>
                  <CardDescription>SOAP note generation settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  LLM Model
                </Label>
                <Select 
                  value={settings.llm_model} 
                  onValueChange={(v) => setSettings({ ...settings, llm_model: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {llmModels.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500 mt-1.5">
                  Model used for generating SOAP notes from transcripts
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Auto-generate SOAP</Label>
                  <p className="text-xs text-slate-500">Automatically generate notes after recording</p>
                </div>
                <Switch
                  checked={settings.auto_generate_soap}
                  onCheckedChange={(v) => setSettings({ ...settings, auto_generate_soap: v })}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-teal-50 border-teal-200">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <SettingsIcon className="w-5 h-5 text-teal-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-teal-800">Privacy First</p>
                  <p className="text-xs text-teal-700 mt-1">
                    All transcription and AI processing can be configured to run locally on your device. 
                    Your medical conversations never leave your computer when using local models.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-red-100 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Account</CardTitle>
              <CardDescription className="text-red-800">Manage your account and session</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
              <p className="text-xs text-red-700 mt-3 text-center">
                You'll be redirected to the login page
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}