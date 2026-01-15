export interface ImageFile {
  id: string;
  name: string;
  file: File;
  preview: string;
  sku?: string;
  processed?: boolean;
  originalUrl?: string;
  processedUrl?: string;
  metadata?: {
    width: number;
    height: number;
    size: number;
  };
}

export interface EditState {
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  rotation?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  whiteBalance?: {
    temperature: number;
    tint: number;
  };
  resize?: {
    width?: number;
    height?: number;
    maintainAspectRatio: boolean;
  };
}

export interface ExportSettings {
  format: 'jpeg' | 'png' | 'webp';
  quality: number;
  dimensions?: {
    width?: number;
    height?: number;
    maintainAspectRatio: boolean;
  };
}

export interface NamingPattern {
  sku: string;
  pattern: string;
  index: number;
}

export interface PhotoRoomResponse {
  result_b64?: string;
  result_url?: string;
  job_id?: string;
  status?: string;
  error?: string;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink?: string;
}

export interface ProcessingQueueItem {
  id: string;
  imageId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
}
