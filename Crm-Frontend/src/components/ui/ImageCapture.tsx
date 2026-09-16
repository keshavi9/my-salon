'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, X, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

interface ImageCaptureProps {
  onImageChange: (file: File | null) => void;
  value?: File | string | null;
  className?: string;
}

export default function ImageCapture({ onImageChange, value, className = '' }: ImageCaptureProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Sync external value
  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    
    if (typeof value === 'string') {
      setPreviewUrl(value);
    } else if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageChange(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsCameraOpen(false);
  }, []);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Draw image and apply horizontal flip if using user-facing camera (optional, but good UX)
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            onImageChange(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`flex flex-col gap-3 w-full ${className}`}>
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* STATE 1: Preview Image */}
      {previewUrl && !isCameraOpen ? (
        <div className="group relative w-full aspect-square overflow-hidden rounded-2xl border border-border bg-background-secondary shadow-sm dark:border-border dark:bg-background-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background-secondary/90 text-text-secondary opacity-0 shadow-md backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-danger-bg hover:text-danger-text group-hover:opacity-100 dark:bg-background-secondary/90 dark:text-text-secondary dark:hover:bg-red-900/50 dark:hover:text-red-400"
            title="Remove image"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
          
          <div className="absolute bottom-3 right-3 flex items-center justify-center rounded-full bg-success/90 p-1.5 text-white opacity-0 shadow-sm backdrop-blur-md transition-all duration-300 group-hover:opacity-100">
            <CheckCircle2 size={14} strokeWidth={2.5} />
          </div>
        </div>
      ) 
      
      /* STATE 2: Camera Open */
      : isCameraOpen ? (
        <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-background shadow-inner ring-1 ring-gray-900/10">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="h-full w-full object-cover transform scale-x-[-1]" // Mirror effect for natural feel
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <button
            type="button"
            onClick={stopCamera}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background-secondary/40 text-white backdrop-blur-md transition-all hover:bg-background-secondary/60 hover:scale-110"
            title="Close camera"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
          
          {/* Camera Controls Overlay */}
          <div className="absolute inset-x-0 bottom-0 flex justify-center pb-5 pt-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <button
              type="button"
              onClick={captureImage}
              className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-background-secondary shadow-lg transition-transform hover:scale-105 active:scale-95"
              title="Capture"
            >
              <div className="absolute inset-[3px] rounded-full border-[2px] border-gray-900 opacity-20 transition-all group-hover:scale-90" />
              <Camera size={20} className="text-text-primary" />
            </button>
          </div>
        </div>
      ) 
      
      /* STATE 3: Empty / Upload Prompt */
      : (
        <div className="flex flex-col gap-3">
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`group relative flex w-full aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-300 ${
              isDragging 
                ? 'border-accent bg-accent-light dark:border-salon-400 dark:bg-salon-900/20' 
                : 'border-border bg-background/50 hover:border-gray-400 hover:bg-hover/50 dark:border-border dark:bg-background-secondary/30 dark:hover:border-gray-600 dark:hover:bg-background-secondary/80'
            }`}
          >
            <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-background-secondary shadow-sm ring-1 transition-all duration-300 group-hover:scale-110 dark:bg-background-secondary ${
              isDragging ? 'ring-accent/50 shadow-salon-500/20 text-accent' : 'ring-gray-900/5 text-text-secondary dark:ring-white/10 dark:text-text-secondary group-hover:text-text-secondary dark:group-hover:text-text-secondary'
            }`}>
              <Upload size={20} className={isDragging ? 'animate-bounce' : ''} />
            </div>
            <p className="text-sm font-semibold text-text-secondary dark:text-text-secondary">
              {isDragging ? 'Drop image here' : 'Click to upload'}
            </p>
            <p className="mt-1 text-xs text-text-secondary dark:text-text-secondary">
              SVG, PNG, JPG or GIF
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border dark:bg-background-secondary"></div>
            <span className="text-[10px] font-bold tracking-widest text-text-secondary dark:text-text-secondary uppercase">OR</span>
            <div className="h-px flex-1 bg-border dark:bg-background-secondary"></div>
          </div>
          
          <button 
            type="button"
            onClick={startCamera}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background-secondary py-2.5 text-xs font-semibold text-text-secondary shadow-sm transition-all hover:bg-background hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 dark:border-border dark:bg-background-secondary dark:text-text-secondary dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <Camera size={14} />
            Take a Photo
          </button>
        </div>
      )}
    </div>
  );
}
