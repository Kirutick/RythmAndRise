import React, { useState, useRef } from 'react';
import { Upload, X, ImageIcon, Video, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { uploadMedia } from '../services/uploadService';

interface MediaUploaderProps {
  onUpload: (media: { type: 'image' | 'video', url: string, title: string }) => void;
}

export default function MediaUploader({ onUpload }: MediaUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<{ type: 'image' | 'video', url: string, name: string, size: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentFileRef = useRef<File | null>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const validateAndProcessFile = (file: File) => {
    setError(null);
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setError('Please upload an image or video file.');
      return;
    }

    // Limit video size for local demo (e.g. 50MB)
    if (isVideo && file.size > 50 * 1024 * 1024) {
      setError('Video is too large. Please keep it under 50MB for this demo.');
      return;
    }

    const url = URL.createObjectURL(file);
    currentFileRef.current = file;
    setPreview({
      type: isImage ? 'image' : 'video',
      url,
      name: file.name,
      size: formatSize(file.size)
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleConfirm = async () => {
    if (!preview || !currentFileRef.current) return;
    
    setIsUploading(true);
    
    try {
      // Simulate upload progress while fetch happens
      let p = 0;
      const interval = setInterval(() => {
        p += 10;
        if (p < 90) setProgress(p); // Cap at 90% until fetch resolves
      }, 200);

      const data = await uploadMedia(currentFileRef.current);
      
      clearInterval(interval);
      setProgress(100);

      setTimeout(() => {
        onUpload({
          type: preview.type,
          url: data.url, // URL returned from backend
          title: data.title || preview.name.split('.')[0]
        });
        setPreview(null);
        currentFileRef.current = null;
        setIsUploading(false);
        setProgress(0);
      }, 500);

    } catch (err: any) {
      setError(err.message || 'Failed to process media. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!preview ? (
        <div 
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-[2.5rem] p-6 sm:p-12 transition-all flex flex-col items-center justify-center text-center gap-4 ${dragActive ? 'border-brand-primary bg-brand-primary/5 scale-[0.99]' : 'border-brand-surface-hover bg-brand-surface/30 hover:border-brand-primary/50'}`}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            accept="image/*,video/*"
            onChange={handleChange}
          />
          
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg text-brand-primary mb-2">
            <Upload className="w-10 h-10" />
          </div>
          
          <div className="space-y-2">
            <h4 className="text-xl font-bold text-brand-text-main">Drop your media here</h4>
            <p className="text-sm text-brand-text-muted">or click to browse your files</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-6 py-3 bg-white text-brand-text-main rounded-2xl font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 border border-brand-surface-hover"
            >
              <ImageIcon className="w-4 h-4 text-brand-primary" /> Photos
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-6 py-3 bg-white text-brand-text-main rounded-2xl font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 border border-brand-surface-hover"
            >
              <Video className="w-4 h-4 text-brand-primary" /> Videos
            </button>
          </div>

          <p className="text-[10px] text-brand-text-muted uppercase tracking-widest font-bold mt-4">
            Supports: JPG, PNG, WEBP, MP4, MOV
          </p>

          {error && (
            <div className="absolute bottom-4 flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 px-4 py-2 rounded-full animate-shake">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-brand-surface-hover p-8 shadow-sm space-y-6 relative overflow-hidden">
          {isUploading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
              <div className="w-64 h-2 bg-brand-surface rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="font-bold text-brand-text-main animate-pulse">Uploading {progress}%</p>
            </div>
          )}

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-32 aspect-square rounded-[2.5rem] bg-brand-surface overflow-hidden border border-brand-surface-hover flex items-center justify-center relative">
                {preview.type === 'image' ? (
                  <>
                    {/* Blurred background for premium feel */}
                    <img src={preview.url} className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-110" alt="" />
                    <img src={preview.url} className="relative z-10 w-full h-full object-contain" alt="Preview" />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-brand-text-main">
                    <Video className="w-8 h-8 text-white opacity-50" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full w-fit">
                  {preview.type === 'image' ? <ImageIcon className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                  <span className="text-[10px] font-black uppercase tracking-wider">{preview.type}</span>
                </div>
                <h4 className="font-bold text-brand-text-main truncate max-w-[200px]">{preview.name}</h4>
                <p className="text-xs text-brand-text-muted font-bold uppercase tracking-widest">{preview.size}</p>
              </div>
            </div>
            <button 
              onClick={() => { setPreview(null); setError(null); }}
              className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleConfirm}
              className="flex-1 bg-brand-primary text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-brand-primary-hover transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" /> Confirm & Upload
            </button>
            <button 
              onClick={() => setPreview(null)}
              className="w-full sm:w-auto px-8 bg-brand-surface text-brand-text-main py-4 rounded-2xl font-bold hover:bg-brand-surface-hover transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
