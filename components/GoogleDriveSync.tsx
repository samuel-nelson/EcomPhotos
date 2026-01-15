'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Folder, Cloud, Loader2 } from 'lucide-react';
import { useImageStore } from '@/store/imageStore';
import { ImageFile } from '@/types';

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
}

export function GoogleDriveSync() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [folders, setFolders] = useState<GoogleDriveFile[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { addImages } = useImageStore();

  useEffect(() => {
    // Check for access token in URL params or localStorage
    const params = new URLSearchParams(window.location.search);
    const token = params.get('access_token') || localStorage.getItem('google_drive_token');
    if (token) {
      setAccessToken(token);
      setIsAuthenticated(true);
      localStorage.setItem('google_drive_token', token);
      loadFolders(token);
    }
  }, []);

  const handleAuth = async () => {
    try {
      const response = await fetch('/api/google-drive/auth');
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const loadFolders = async (token: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/google-drive/folders?access_token=${token}`);
      const data = await response.json();
      if (data.folders) {
        setFolders(data.folders);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async (folderId: string) => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const response = await fetch(
        `/api/google-drive/files?access_token=${accessToken}&folder_id=${folderId}`
      );
      const data = await response.json();
      if (data.files) {
        setFiles(data.files);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncFiles = async () => {
    if (!accessToken || !selectedFolderId) return;
    try {
      setSyncing(true);
      const imageFiles: ImageFile[] = [];

      for (const file of files) {
        if (file.mimeType.startsWith('image/')) {
          try {
            const response = await fetch(
              `/api/google-drive/download?access_token=${accessToken}&file_id=${file.id}`
            );
            const blob = await response.blob();
            const fileObj = new File([blob], file.name, { type: file.mimeType });
            const preview = URL.createObjectURL(fileObj);

            imageFiles.push({
              id: `${file.id}-${Date.now()}`,
              name: file.name,
              file: fileObj,
              preview,
              metadata: {
                width: 0,
                height: 0,
                size: fileObj.size,
              },
            });
          } catch (error) {
            console.error(`Error downloading ${file.name}:`, error);
          }
        }
      }

      addImages(imageFiles);
      setSyncing(false);
    } catch (error) {
      console.error('Error syncing files:', error);
      setSyncing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Google Drive Integration
          </CardTitle>
          <CardDescription>
            Connect your Google Drive to import images
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleAuth} className="w-full">
            Connect Google Drive
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Google Drive
        </CardTitle>
        <CardDescription>
          Select a folder to sync images
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Folder</label>
          <Select
            value={selectedFolderId}
            onValueChange={(value) => {
              setSelectedFolderId(value);
              loadFiles(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a folder" />
            </SelectTrigger>
            <SelectContent>
              {folders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    {folder.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {files.length} image(s) found
            </p>
            <Button
              onClick={syncFiles}
              disabled={syncing || loading}
              className="w-full"
            >
              {syncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                'Sync Images'
              )}
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
