'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useSettingsStore } from '@/store/settingsStore';
import { useImageStore } from '@/store/imageStore';
import { Download, Upload, Loader2 } from 'lucide-react';
import { exportImage, downloadImage } from '@/lib/image-processing/export';
import { generateFileName } from '@/lib/naming/convention';

export function ExportSettings() {
  const { exportSettings, namingPattern, updateExportSettings } = useSettingsStore();
  const { images, selectedImages } = useImageStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportToDrive, setExportToDrive] = useState(false);

  const handleBulkExport = async () => {
    setIsExporting(true);
    const imagesToExport = selectedImages.length > 0
      ? images.filter((img) => selectedImages.includes(img.id))
      : images;

    try {
      for (let i = 0; i < imagesToExport.length; i++) {
        const image = imagesToExport[i];
        
        // Create canvas from image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = image.preview;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }

        // Generate filename
        const fileName = generateFileName(namingPattern, i);
        const extension = exportSettings.format === 'jpeg' ? 'jpg' : exportSettings.format;
        const fullFileName = `${fileName}.${extension}`;

        // Export image
        const blob = await exportImage(canvas, exportSettings, fullFileName);

        if (exportToDrive) {
          // Upload to Google Drive
          const accessToken = localStorage.getItem('google_drive_token');
          if (accessToken) {
            const formData = new FormData();
            formData.append('file', blob, fullFileName);
            formData.append('file_name', fullFileName);
            formData.append('access_token', accessToken);

            await fetch('/api/google-drive/upload', {
              method: 'POST',
              body: formData,
            });
          }
        } else {
          // Download locally
          downloadImage(blob, fullFileName);
        }

        // Small delay to prevent browser blocking multiple downloads
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Settings</CardTitle>
        <CardDescription>
          Configure export format, quality, and dimensions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Format</Label>
          <Select
            value={exportSettings.format}
            onValueChange={(value: 'jpeg' | 'png' | 'webp') =>
              updateExportSettings({ format: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jpeg">JPEG</SelectItem>
              <SelectItem value="png">PNG</SelectItem>
              <SelectItem value="webp">WebP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Quality</Label>
            <span className="text-sm text-muted-foreground">
              {exportSettings.quality}%
            </span>
          </div>
          <Slider
            value={[exportSettings.quality]}
            onValueChange={([value]) => updateExportSettings({ quality: value })}
            min={1}
            max={100}
            step={1}
          />
        </div>

        <div className="space-y-2">
          <Label>Dimensions (Optional)</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                placeholder="Width"
                value={exportSettings.dimensions?.width || ''}
                onChange={(e) =>
                  updateExportSettings({
                    dimensions: {
                      ...exportSettings.dimensions,
                      width: parseInt(e.target.value) || undefined,
                      maintainAspectRatio: exportSettings.dimensions?.maintainAspectRatio || true,
                    },
                  })
                }
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Height"
                value={exportSettings.dimensions?.height || ''}
                onChange={(e) =>
                  updateExportSettings({
                    dimensions: {
                      ...exportSettings.dimensions,
                      height: parseInt(e.target.value) || undefined,
                      maintainAspectRatio: exportSettings.dimensions?.maintainAspectRatio || true,
                    },
                  })
                }
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={exportSettings.dimensions?.maintainAspectRatio || false}
              onChange={(e) =>
                updateExportSettings({
                  dimensions: {
                    ...exportSettings.dimensions,
                    maintainAspectRatio: e.target.checked,
                  },
                })
              }
            />
            Maintain aspect ratio
          </label>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={exportToDrive}
              onChange={(e) => setExportToDrive(e.target.checked)}
            />
            Export to Google Drive
          </label>
        </div>

        <Button
          onClick={handleBulkExport}
          disabled={isExporting || images.length === 0}
          className="w-full"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              {exportToDrive ? (
                <Upload className="h-4 w-4 mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export {selectedImages.length > 0 ? `${selectedImages.length} selected` : 'all'} images
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
