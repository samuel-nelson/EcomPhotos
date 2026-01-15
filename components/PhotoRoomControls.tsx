'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Wand2, Sparkles, Image as ImageIcon, Settings, CheckCircle2, Loader2 } from 'lucide-react';
import { ImageFile } from '@/types';

interface PhotoRoomControlsProps {
  image: ImageFile;
  onProcessed: (processedUrl: string) => void;
}

export function PhotoRoomControls({ image, onProcessed }: PhotoRoomControlsProps) {
  const [processing, setProcessing] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const processWithPhotoRoom = async (endpoint: string, formData: FormData) => {
    try {
      setProcessing(endpoint);
      setError(null);

      const response = await fetch(`/api/photoroom/${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Processing failed');
      }

      const result = await response.json();
      
      if (result.result_url) {
        onProcessed(result.result_url);
      } else if (result.result_b64) {
        const blob = await fetch(`data:image/png;base64,${result.result_b64}`).then(r => r.blob());
        const url = URL.createObjectURL(blob);
        onProcessed(url);
      } else if (result.job_id) {
        // Poll for job completion
        pollJobStatus(result.job_id, onProcessed);
      }
    } catch (err: any) {
      setError(err.message || 'Processing failed');
      console.error('PhotoRoom processing error:', err);
    } finally {
      setProcessing(null);
    }
  };

  const pollJobStatus = async (jobId: string, callback: (url: string) => void) => {
    const maxAttempts = 30;
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`/api/photoroom/job/${jobId}`);
        const result = await response.json();

        if (result.status === 'completed') {
          if (result.result_url) {
            callback(result.result_url);
          } else if (result.result_b64) {
            const blob = await fetch(`data:image/png;base64,${result.result_b64}`).then(r => r.blob());
            const url = URL.createObjectURL(blob);
            callback(url);
          }
        } else if (result.status === 'failed') {
          throw new Error(result.error || 'Job failed');
        } else if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
          attempts++;
        } else {
          throw new Error('Job timeout');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to check job status');
      }
    };

    poll();
  };

  const handleBackgroundRemove = async () => {
    const formData = new FormData();
    formData.append('image_file', image.file);
    formData.append('format', 'png');
    await processWithPhotoRoom('background-remove', formData);
  };

  const handleAIBackground = async () => {
    const formData = new FormData();
    formData.append('image_file', image.file);
    formData.append('format', 'png');
    if (aiPrompt) {
      formData.append('prompt', aiPrompt);
    }
    await processWithPhotoRoom('ai-background', formData);
  };

  const handlePhotoFix = async () => {
    const formData = new FormData();
    formData.append('image_file', image.file);
    formData.append('format', 'png');
    await processWithPhotoRoom('photofix', formData);
  };

  const handleReposition = async () => {
    const formData = new FormData();
    formData.append('image_file', image.file);
    formData.append('format', 'png');
    await processWithPhotoRoom('reposition', formData);
  };

  const handleBeautify = async () => {
    const formData = new FormData();
    formData.append('image_file', image.file);
    formData.append('format', 'png');
    await processWithPhotoRoom('beautify', formData);
  };

  const handleAnalyzeQA = async () => {
    try {
      setProcessing('analyze-qa');
      setError(null);

      const formData = new FormData();
      formData.append('image_file', image.file);

      const response = await fetch('/api/photoroom/analyze-qa', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      // Display analysis results (you can create a dialog for this)
      console.log('QA Analysis:', result);
      alert(`Analysis complete. Issues: ${result.issues?.length || 0}, Suggestions: ${result.suggestions?.length || 0}`);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          PhotoRoom AI
        </CardTitle>
        <CardDescription>
          AI-powered image processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleBackgroundRemove}
            disabled={!!processing}
            variant="outline"
            className="w-full"
          >
            {processing === 'background-remove' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4 mr-2" />
            )}
            Remove BG
          </Button>

          <Button
            onClick={handlePhotoFix}
            disabled={!!processing}
            variant="outline"
            className="w-full"
          >
            {processing === 'photofix' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Settings className="h-4 w-4 mr-2" />
            )}
            PhotoFix
          </Button>

          <Button
            onClick={handleReposition}
            disabled={!!processing}
            variant="outline"
            className="w-full"
          >
            {processing === 'reposition' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            Reposition
          </Button>

          <Button
            onClick={handleBeautify}
            disabled={!!processing}
            variant="outline"
            className="w-full"
          >
            {processing === 'beautify' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4 mr-2" />
            )}
            Beautify
          </Button>
        </div>

        <div className="space-y-2">
          <Input
            placeholder="AI background prompt (e.g., 'white background', 'outdoor scene')"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
          />
          <Button
            onClick={handleAIBackground}
            disabled={!!processing}
            variant="outline"
            className="w-full"
          >
            {processing === 'ai-background' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            AI Background
          </Button>
        </div>

        <Button
          onClick={handleAnalyzeQA}
          disabled={!!processing}
          variant="outline"
          className="w-full"
        >
          {processing === 'analyze-qa' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4 mr-2" />
          )}
          Analyze QA
        </Button>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
