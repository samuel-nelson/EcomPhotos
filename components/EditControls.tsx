'use client';

import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RotateCw, Crop, Maximize2, Sun, Palette, Contrast } from 'lucide-react';
import { EditState } from '@/types';

interface EditControlsProps {
  editState: EditState;
  onEditChange: (updates: Partial<EditState>) => void;
  onCrop: () => void;
  onReset: () => void;
}

export function EditControls({ editState, onEditChange, onCrop, onReset }: EditControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="transform" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transform">Transform</TabsTrigger>
            <TabsTrigger value="color">Color</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="transform" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <RotateCw className="h-4 w-4" />
                  Rotation
                </label>
                <span className="text-sm text-muted-foreground">
                  {editState.rotation || 0}°
                </span>
              </div>
              <Slider
                value={[editState.rotation || 0]}
                onValueChange={([value]) => onEditChange({ rotation: value })}
                min={-180}
                max={180}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Crop className="h-4 w-4" />
                  Crop
                </label>
              </div>
              <Button onClick={onCrop} variant="outline" className="w-full">
                Open Crop Tool
              </Button>
            </div>

            {editState.resize && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Maximize2 className="h-4 w-4" />
                    Resize
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Width</label>
                    <input
                      type="number"
                      value={editState.resize.width || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const parsed = value === '' ? undefined : parseInt(value, 10);
                        onEditChange({
                          resize: {
                            ...editState.resize!,
                            width: parsed !== undefined && !Number.isNaN(parsed) ? parsed : undefined,
                          },
                        });
                      }}
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Height</label>
                    <input
                      type="number"
                      value={editState.resize.height || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        const parsed = value === '' ? undefined : parseInt(value, 10);
                        onEditChange({
                          resize: {
                            ...editState.resize!,
                            height: parsed !== undefined && !Number.isNaN(parsed) ? parsed : undefined,
                          },
                        });
                      }}
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editState.resize.maintainAspectRatio}
                    onChange={(e) =>
                      onEditChange({
                        resize: {
                          ...editState.resize!,
                          maintainAspectRatio: e.target.checked,
                        },
                      })
                    }
                  />
                  Maintain aspect ratio
                </label>
              </div>
            )}

            <Button onClick={onReset} variant="outline" className="w-full">
              Reset Transform
            </Button>
          </TabsContent>

          <TabsContent value="color" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  Brightness
                </label>
                <span className="text-sm text-muted-foreground">
                  {editState.brightness || 0}
                </span>
              </div>
              <Slider
                value={[editState.brightness || 0]}
                onValueChange={([value]) => onEditChange({ brightness: value })}
                min={-100}
                max={100}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Contrast className="h-4 w-4" />
                  Contrast
                </label>
                <span className="text-sm text-muted-foreground">
                  {editState.contrast || 0}
                </span>
              </div>
              <Slider
                value={[editState.contrast || 0]}
                onValueChange={([value]) => onEditChange({ contrast: value })}
                min={-100}
                max={100}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Saturation
                </label>
                <span className="text-sm text-muted-foreground">
                  {editState.saturation || 0}
                </span>
              </div>
              <Slider
                value={[editState.saturation || 0]}
                onValueChange={([value]) => onEditChange({ saturation: value })}
                min={-100}
                max={100}
                step={1}
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            {editState.whiteBalance && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Temperature</label>
                    <span className="text-sm text-muted-foreground">
                      {editState.whiteBalance.temperature}
                    </span>
                  </div>
                  <Slider
                    value={[editState.whiteBalance.temperature]}
                    onValueChange={([value]) =>
                      onEditChange({
                        whiteBalance: {
                          ...editState.whiteBalance!,
                          temperature: value,
                        },
                      })
                    }
                    min={-100}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Tint</label>
                    <span className="text-sm text-muted-foreground">
                      {editState.whiteBalance.tint}
                    </span>
                  </div>
                  <Slider
                    value={[editState.whiteBalance.tint]}
                    onValueChange={([value]) =>
                      onEditChange({
                        whiteBalance: {
                          ...editState.whiteBalance!,
                          tint: value,
                        },
                      })
                    }
                    min={-100}
                    max={100}
                    step={1}
                  />
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
