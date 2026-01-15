'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useImageStore } from '@/store/imageStore';
import { ImageFile } from '@/types';
import { ImageIcon, X, Edit2, Check } from 'lucide-react';
import { ImageEditor } from './ImageEditor';

export function ImageGallery() {
  const { images, selectedImages, selectImage, deselectImage, removeImage, selectAll, deselectAll } = useImageStore();
  const [editingImage, setEditingImage] = useState<ImageFile | null>(null);

  if (editingImage) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setEditingImage(null)}
        >
          ← Back to Gallery
        </Button>
        <ImageEditor
          image={editingImage}
          onUpdate={(updates) => {
            // Update logic handled by store
            setEditingImage({ ...editingImage, ...updates });
          }}
          onClose={() => setEditingImage(null)}
        />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No images uploaded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">
          Images ({images.length})
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={selectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={deselectAll}>
            Deselect All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => {
          const isSelected = selectedImages.includes(image.id);
          return (
            <Card
              key={image.id}
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => {
                if (isSelected) {
                  deselectImage(image.id);
                } else {
                  selectImage(image.id);
                }
              }}
            >
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <img
                    src={image.preview}
                    alt={image.name}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingImage(image);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{image.name}</p>
                  {image.sku && (
                    <p className="text-xs text-muted-foreground">SKU: {image.sku}</p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(image.id);
                    }}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
