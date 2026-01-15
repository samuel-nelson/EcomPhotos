'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettingsStore } from '@/store/settingsStore';
import { useImageStore } from '@/store/imageStore';
import { generateFileName, previewNames, validatePattern } from '@/lib/naming/convention';
import { Tag, Eye } from 'lucide-react';

export function NamingConvention() {
  const { namingPattern, updateNamingPattern } = useSettingsStore();
  const { images, selectedImages, updateImage } = useImageStore();
  const [previewCount, setPreviewCount] = useState(5);

  const handleApply = () => {
    const imagesToRename = selectedImages.length > 0
      ? images.filter((img) => selectedImages.includes(img.id))
      : images;

    imagesToRename.forEach((image, index) => {
      const newName = generateFileName(namingPattern, index);
      const extension = image.name.split('.').pop() || '';
      updateImage(image.id, {
        name: `${newName}.${extension}`,
        sku: namingPattern.sku,
      });
    });
  };

  const validation = validatePattern(namingPattern.pattern);
  const previewNamesList = previewNames(namingPattern, previewCount);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Naming Convention
        </CardTitle>
        <CardDescription>
          Set SKU-based naming pattern for exported images
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="sku">Product SKU</Label>
          <Input
            id="sku"
            placeholder="TESTSKU"
            value={namingPattern.sku}
            onChange={(e) => updateNamingPattern({ sku: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pattern">Naming Pattern</Label>
          <Input
            id="pattern"
            placeholder="{SKU}_{INDEX}"
            value={namingPattern.pattern}
            onChange={(e) => updateNamingPattern({ pattern: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Available variables: {'{SKU}'}, {'{INDEX}'} (A-Z), {'{NUMBER}'}, {'{PADDED_NUMBER}'}
          </p>
          {!validation.valid && (
            <p className="text-xs text-destructive">{validation.error}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Preview</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                max="20"
                value={previewCount}
                onChange={(e) => setPreviewCount(parseInt(e.target.value) || 1)}
                className="w-20"
              />
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="bg-muted p-3 rounded-md space-y-1 max-h-32 overflow-y-auto">
            {previewNamesList.map((name, index) => (
              <div key={index} className="text-sm font-mono">
                {name}
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleApply}
          disabled={!validation.valid || !namingPattern.sku}
          className="w-full"
        >
          Apply to {selectedImages.length > 0 ? `${selectedImages.length} selected` : 'all'} images
        </Button>
      </CardContent>
    </Card>
  );
}
