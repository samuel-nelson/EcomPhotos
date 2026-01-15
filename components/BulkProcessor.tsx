'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useImageStore } from '@/store/imageStore';
import { Loader2, Play, Square, CheckCircle2, XCircle } from 'lucide-react';

export function BulkProcessor() {
  const { images, selectedImages, processingQueue, updateQueueItem, addToQueue } = useImageStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentBatch, setCurrentBatch] = useState<string[]>([]);

  const processBatch = useCallback(async (imageIds: string[]) => {
    setIsProcessing(true);
    setCurrentBatch(imageIds);

    // Process images in parallel with rate limiting (max 3 concurrent)
    const batchSize = 3;
    const batches: string[][] = [];

    for (let i = 0; i < imageIds.length; i += batchSize) {
      batches.push(imageIds.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      await Promise.all(
        batch.map(async (imageId) => {
          const image = images.find((img) => img.id === imageId);
          if (!image) return;

          const queueId = `${imageId}-${Date.now()}`;
          addToQueue({
            id: queueId,
            imageId,
            status: 'processing',
            progress: 0,
          });

          try {
            // Simulate processing with progress updates
            for (let progress = 0; progress <= 100; progress += 10) {
              await new Promise((resolve) => setTimeout(resolve, 200));
              updateQueueItem(queueId, { progress });
            }

            updateQueueItem(queueId, {
              status: 'completed',
              progress: 100,
            });
          } catch (error: any) {
            updateQueueItem(queueId, {
              status: 'failed',
              error: error.message,
            });
          }
        })
      );
    }

    setIsProcessing(false);
    setCurrentBatch([]);
  }, [images, addToQueue, updateQueueItem]);

  const handleProcessSelected = () => {
    if (selectedImages.length > 0) {
      processBatch(selectedImages);
    }
  };

  const handleProcessAll = () => {
    processBatch(images.map((img) => img.id));
  };

  const activeQueueItems = processingQueue.filter(
    (item) => item.status === 'processing' || item.status === 'pending'
  );
  const completedItems = processingQueue.filter((item) => item.status === 'completed');
  const failedItems = processingQueue.filter((item) => item.status === 'failed');

  const overallProgress =
    processingQueue.length > 0
      ? processingQueue.reduce((sum, item) => sum + item.progress, 0) /
        processingQueue.length
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Processing</CardTitle>
        <CardDescription>
          Process multiple images simultaneously
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={handleProcessSelected}
            disabled={isProcessing || selectedImages.length === 0}
            className="flex-1"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Process Selected ({selectedImages.length})
          </Button>
          <Button
            onClick={handleProcessAll}
            disabled={isProcessing || images.length === 0}
            variant="outline"
            className="flex-1"
          >
            Process All ({images.length})
          </Button>
        </div>

        {processingQueue.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} />

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Processing: {activeQueueItems.length}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Completed: {completedItems.length}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span>Failed: {failedItems.length}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1 max-h-48 overflow-y-auto">
              {processingQueue.map((item) => {
                const image = images.find((img) => img.id === item.imageId);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 border rounded text-sm"
                  >
                    <span className="truncate flex-1">
                      {image?.name || 'Unknown'}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.status === 'processing' && (
                        <Progress value={item.progress} className="w-24" />
                      )}
                      {item.status === 'completed' && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      {item.status === 'failed' && (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
