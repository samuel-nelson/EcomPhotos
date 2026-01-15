'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EditControls } from './EditControls';
import { PhotoRoomControls } from './PhotoRoomControls';
import { Undo2, Redo2, Download, Loader2 } from 'lucide-react';
import { ImageFile, EditState } from '@/types';
import { applyFilters } from '@/lib/image-processing/filters';
import { resizeImage } from '@/lib/image-processing/resize';
import { cropImage, CropArea } from '@/lib/image-processing/crop';
import { exportImage, downloadImage } from '@/lib/image-processing/export';
import { useSettingsStore } from '@/store/settingsStore';

interface ImageEditorProps {
  image: ImageFile;
  onUpdate: (updates: Partial<ImageFile>) => void;
  onClose?: () => void;
}

interface HistoryState {
  canvas: HTMLCanvasElement;
  editState: EditState;
}

export function ImageEditor({ image, onUpdate, onClose }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [editState, setEditState] = useState<EditState>({});
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCropMode, setIsCropMode] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const { exportSettings } = useSettingsStore();

  const loadImage = useCallback(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          saveToHistory(canvas, editState);
        }
      }
    };
    img.src = image.preview;
  }, [image.preview, editState]);

  useEffect(() => {
    loadImage();
  }, [loadImage]);

  const saveToHistory = (canvas: HTMLCanvasElement, state: EditState) => {
    const newCanvas = document.createElement('canvas');
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;
    const ctx = newCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(canvas, 0, 0);
    }
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ canvas: newCanvas, editState: state });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const applyEdits = useCallback(() => {
    if (!imageRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    const canvas = canvasRef.current;
    const sourceImage = imageRef.current;
    
    // Convert image to canvas - imageRef.current is always HTMLImageElement
    // Create a temporary canvas from the image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = sourceImage.naturalWidth || sourceImage.width;
    tempCanvas.height = sourceImage.naturalHeight || sourceImage.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.drawImage(sourceImage, 0, 0);
    }
    let processedImage: HTMLCanvasElement = tempCanvas;

    // Apply crop first if in crop mode
    if (isCropMode && cropArea) {
      processedImage = cropImage(processedImage, cropArea);
      setIsCropMode(false);
      setCropArea(null);
    }

    // Apply resize
    if (editState.resize) {
      processedImage = resizeImage(processedImage, editState.resize);
    }

    // Apply filters
    if (
      editState.brightness !== undefined ||
      editState.contrast !== undefined ||
      editState.saturation !== undefined ||
      editState.rotation !== undefined ||
      editState.whiteBalance
    ) {
      processedImage = applyFilters(processedImage, {
        brightness: editState.brightness,
        contrast: editState.contrast,
        saturation: editState.saturation,
        rotation: editState.rotation,
        whiteBalance: editState.whiteBalance,
      });
    }

    // Draw to canvas
    canvas.width = processedImage.width;
    canvas.height = processedImage.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(processedImage, 0, 0);
      saveToHistory(canvas, editState);
    }

    setIsProcessing(false);
  }, [editState, isCropMode, cropArea, history, historyIndex]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyEdits();
    }, 300); // Debounce edits

    return () => clearTimeout(timeoutId);
  }, [editState, applyEdits]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      setHistoryIndex(newIndex);
      setEditState(state.editState);
      
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = state.canvas.width;
        canvas.height = state.canvas.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(state.canvas, 0, 0);
        }
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      setHistoryIndex(newIndex);
      setEditState(state.editState);
      
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = state.canvas.width;
        canvas.height = state.canvas.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(state.canvas, 0, 0);
        }
      }
    }
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;

    try {
      setIsProcessing(true);
      const blob = await exportImage(
        canvasRef.current,
        exportSettings,
        image.name
      );
      downloadImage(blob, image.name);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCrop = () => {
    setIsCropMode(true);
    // Simple crop implementation - in production, use a proper crop library
    const canvas = canvasRef.current;
    if (canvas) {
      setCropArea({
        x: canvas.width * 0.1,
        y: canvas.height * 0.1,
        width: canvas.width * 0.8,
        height: canvas.height * 0.8,
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">{image.name}</h3>
                {image.sku && (
                  <p className="text-sm text-muted-foreground mt-1">SKU: {image.sku}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  title="Undo"
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  title="Redo"
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={isProcessing}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Export
                </Button>
              </div>
            </div>
            <div className="relative bg-gradient-to-br from-muted to-muted/50 rounded-xl overflow-hidden border-2 border-border shadow-inner">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto mx-auto block"
                style={{ display: 'block' }}
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-xl">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Processing...</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <PhotoRoomControls
          image={image}
          onProcessed={(processedUrl) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              imageRef.current = img;
              const canvas = canvasRef.current;
              if (canvas) {
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(img, 0, 0);
                  saveToHistory(canvas, editState);
                }
              }
            };
            img.src = processedUrl;
          }}
        />
        <EditControls
          editState={editState}
          onEditChange={(updates) => setEditState({ ...editState, ...updates })}
          onCrop={handleCrop}
          onReset={() => {
            setEditState({});
            loadImage();
          }}
        />
      </div>
    </div>
  );
}
