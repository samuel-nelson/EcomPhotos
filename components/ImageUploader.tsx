'use client';

import { useCallback, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useImageStore } from '@/store/imageStore';
import { ImageFile } from '@/types';
import { GoogleDriveSync } from './GoogleDriveSync';

export function ImageUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addImages } = useImageStore();

  const processFiles = useCallback(async (fileList: FileList) => {
    const imageFiles: ImageFile[] = [];
    const files = Array.from(fileList).filter(file => file.type.startsWith('image/'));

    for (const file of files) {
      const preview = URL.createObjectURL(file);
      const img = new Image();
      
      await new Promise((resolve) => {
        img.onload = () => {
          imageFiles.push({
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            name: file.name,
            file,
            preview,
            metadata: {
              width: img.width,
              height: img.height,
              size: file.size,
            },
          });
          resolve(null);
        };
        img.src = preview;
      });
    }

    addImages(imageFiles);
  }, [addImages]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files.length > 0) {
      setUploading(true);
      await processFiles(e.dataTransfer.files);
      setUploading(false);
    }
  }, [processFiles]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploading(true);
      await processFiles(e.target.files);
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [processFiles]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload Images</CardTitle>
          <CardDescription>
            Drag and drop images or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors
              ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
              ${uploading ? 'pointer-events-none opacity-50' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Processing images...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    Drop images here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports multiple files
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <GoogleDriveSync />
    </div>
  );
}
