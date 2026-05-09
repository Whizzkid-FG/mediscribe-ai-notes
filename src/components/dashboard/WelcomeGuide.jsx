import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, FileText, Save, Settings } from 'lucide-react';

export default function WelcomeGuide({ open, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to MedScribe</DialogTitle>
          <DialogDescription>
            Your AI-powered medical transcription assistant
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
              <Mic className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">1. Start Recording</h3>
              <p className="text-sm text-slate-600">
                Click the microphone button to start recording your patient conversation. 
                Speak naturally—the app will transcribe in real-time.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">2. Auto-Generate SOAP Notes</h3>
              <p className="text-sm text-slate-600">
                When you stop recording, the app automatically generates a structured SOAP note 
                from your transcript. You can edit it before saving.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Save className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">3. Save & Manage Sessions</h3>
              <p className="text-sm text-slate-600">
                Add patient details and save your session. Access all your sessions 
                from the Sessions page to review or export.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Settings className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">4. Customize Settings</h3>
              <p className="text-sm text-slate-600">
                Visit Settings to choose your preferred AI models, templates, and configure 
                auto-generation options.
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> Ensure microphone access is enabled in your browser. 
              This app works best with Chrome, Edge, or Safari.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose} className="bg-teal-600 hover:bg-teal-700">
            Got it, let's start!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}