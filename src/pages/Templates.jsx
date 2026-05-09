import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Plus, 
  FileText, 
  Pencil, 
  Trash2, 
  Star,
  Stethoscope,
  Loader2,
  Save
} from 'lucide-react';
import { toast } from "sonner";

import EmptyState from '../components/common/EmptyState';

const specialties = [
  { value: 'general', label: 'General Practice' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'orthopedics', label: 'Orthopedics' },
  { value: 'pediatrics', label: 'Pediatrics' },
  { value: 'psychiatry', label: 'Psychiatry' },
  { value: 'dermatology', label: 'Dermatology' },
  { value: 'neurology', label: 'Neurology' },
];

const defaultTemplate = {
  name: '',
  description: '',
  specialty: 'general',
  subjective_prompt: 'Extract the chief complaint, history of present illness, and relevant past medical history.',
  objective_prompt: 'Identify physical examination findings, vital signs, and any lab or imaging results mentioned.',
  assessment_prompt: 'Formulate a diagnosis or list of differential diagnoses based on the subjective and objective findings.',
  plan_prompt: 'Outline the treatment plan including medications, procedures, follow-up appointments, and patient education.',
  is_default: false
};

export default function Templates() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => Promise.resolve([]), // TODO: Implement templates API endpoint
  });

  const saveMutation = useMutation({
    mutationFn: (data) => Promise.resolve({}), // TODO: Implement save template API
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template saved');
      setIsEditing(false);
      setCurrentTemplate(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => Promise.resolve({}), // TODO: Implement delete template API
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Template deleted');
    }
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (templateId) => {
      // TODO: Implement set default template API
      return Promise.resolve({});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Default template updated');
    }
  });

  const openEditor = (template = null) => {
    setCurrentTemplate(template ? { ...template } : { ...defaultTemplate });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!currentTemplate.name.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    saveMutation.mutate(currentTemplate);
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
                <h1 className="text-xl font-semibold text-slate-800">SOAP Templates</h1>
                <p className="text-xs text-slate-500">Customize your note generation</p>
              </div>
            </div>
            
            <Button onClick={() => openEditor()} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : templates.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No templates yet"
            description="Create custom SOAP note templates for different medical specialties"
            action="Create Template"
            onAction={() => openEditor()}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {template.name}
                            {template.is_default && (
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {template.description || 'No description'}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">
                          {specialties.find(s => s.value === template.specialty)?.label || template.specialty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-slate-500">
                        <p className="line-clamp-2">
                          <strong className="text-slate-700">S:</strong> {template.subjective_prompt}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditor(template)}
                          className="flex-1"
                        >
                          <Pencil className="w-3.5 h-3.5 mr-1.5" />
                          Edit
                        </Button>
                        {!template.is_default && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDefaultMutation.mutate(template.id)}
                          >
                            <Star className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(template.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Editor Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentTemplate?.id ? 'Edit Template' : 'New Template'}
            </DialogTitle>
          </DialogHeader>
          
          {currentTemplate && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Template Name
                  </label>
                  <Input
                    value={currentTemplate.name}
                    onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
                    placeholder="e.g., Cardiology Follow-up"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Specialty
                  </label>
                  <Select 
                    value={currentTemplate.specialty} 
                    onValueChange={(v) => setCurrentTemplate({ ...currentTemplate, specialty: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Description
                </label>
                <Input
                  value={currentTemplate.description || ''}
                  onChange={(e) => setCurrentTemplate({ ...currentTemplate, description: e.target.value })}
                  placeholder="Brief description of when to use this template"
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-slate-800">Section Prompts</h4>
                
                {[
                  { key: 'subjective_prompt', label: 'Subjective', color: 'bg-blue-500' },
                  { key: 'objective_prompt', label: 'Objective', color: 'bg-emerald-500' },
                  { key: 'assessment_prompt', label: 'Assessment', color: 'bg-amber-500' },
                  { key: 'plan_prompt', label: 'Plan', color: 'bg-purple-500' },
                ].map(section => (
                  <div key={section.key} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-1.5 h-6 rounded-full ${section.color}`} />
                      <label className="text-sm font-medium text-slate-700">
                        {section.label}
                      </label>
                    </div>
                    <Textarea
                      value={currentTemplate[section.key] || ''}
                      onChange={(e) => setCurrentTemplate({ 
                        ...currentTemplate, 
                        [section.key]: e.target.value 
                      })}
                      placeholder={`Instructions for generating the ${section.label.toLowerCase()} section...`}
                      className="min-h-[80px] resize-none"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
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
                  Save Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}