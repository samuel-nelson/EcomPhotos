'use client';

import { BulkProcessor } from '@/components/BulkProcessor';
import { ImageGallery } from '@/components/ImageGallery';
import { NamingConvention } from '@/components/NamingConvention';

export default function BulkPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Bulk Processing</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BulkProcessor />
          </div>
          <div>
            <NamingConvention />
          </div>
        </div>
        <ImageGallery />
      </div>
    </div>
  );
}
