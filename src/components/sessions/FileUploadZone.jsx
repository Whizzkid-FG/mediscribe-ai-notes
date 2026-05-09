import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, File } from 'lucide-react';
import { toast } from 'sonner';

export default function FileUploadZone({ files = [], onFilesChange }) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const newFiles = [];

    try {
      for (const file of selectedFiles) {
        // TODO: Implement file upload API endpoint
        newFiles.push({
          url: URL.createObjectURL(file), // Use temporary blob URL
          name: file.name,
          type: file.type,
          size: file.size
        });
      }
      onFilesChange([...files, ...newFiles]);
      toast.success(`${newFiles.length} file(s) selected`);
    } catch (error) {
      toast.error('Failed to process files');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    const updated = files.filter((_, i) => i !== index);
    onFilesChange(updated);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-3">
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-teal-400 transition-colors">
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          accept="*/*"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600 mb-1">
            {uploading ? 'Uploading...' : 'Click to upload files'}
          </p>
          <p className="text-xs text-slate-400">
            Documents, images, audio files
          </p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
            >
              {file.type?.includes('image') ? (
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
              ) : (
                <File className="w-5 h-5 text-slate-600 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(index)}
                className="flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}