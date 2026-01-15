'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ImageEditor } from '@/components/ImageEditor';
import { useImageStore } from '@/store/imageStore';
import { ImageFile } from '@/types';
import { Loader2 } from 'lucide-react';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const { images, updateImage } = useImageStore();
  const [image, setImage] = useState<ImageFile | null>(null);

  useEffect(() => {
    const imageId = params.id as string;
    const foundImage = images.find((img) => img.id === imageId);
    if (foundImage) {
      setImage(foundImage);
    }
  }, [params.id, images]);

  if (!image) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <ImageEditor
        image={image}
        onUpdate={(updates) => {
          updateImage(image.id, updates);
          setImage({ ...image, ...updates });
        }}
        onClose={() => router.push('/')}
      />
    </div>
  );
}
