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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  EcomPhotos
                </h1>
                <p className="text-xs text-muted-foreground">
                  Enterprise Photo Processing
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger value="upload" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Camera className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="process" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Settings className="h-4 w-4" />
              Process
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
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
