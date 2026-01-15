'use client';

import { useState } from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { ImageGallery } from '@/components/ImageGallery';
import { BulkProcessor } from '@/components/BulkProcessor';
import { NamingConvention } from '@/components/NamingConvention';
import { ExportSettings } from '@/components/ExportSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Settings, Download } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="h-6 w-6" />
              <h1 className="text-2xl font-bold">EcomPhotos</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Enterprise Photo Processing
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="process" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Process
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ImageUploader />
              </div>
              <div>
                <NamingConvention />
              </div>
            </div>
            <ImageGallery />
          </TabsContent>

          <TabsContent value="process" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BulkProcessor />
              <div className="space-y-4">
                <NamingConvention />
              </div>
            </div>
            <ImageGallery />
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExportSettings />
              <NamingConvention />
            </div>
            <ImageGallery />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
