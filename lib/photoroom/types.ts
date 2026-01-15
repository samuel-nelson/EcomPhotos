export interface PhotoRoomApiResponse {
  result_b64?: string;
  result_url?: string;
  job_id?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  message?: string;
}

export interface BackgroundRemoveRequest {
  image_file?: File | Blob;
  image_url?: string;
  format?: 'png' | 'jpg';
  crop?: boolean;
  crop_margin?: number;
  scale?: string;
  position?: string;
}

export interface AIBackgroundRequest {
  image_file?: File | Blob;
  image_url?: string;
  prompt?: string;
  negative_prompt?: string;
  format?: 'png' | 'jpg';
  scale?: string;
}

export interface PhotoFixRequest {
  image_file?: File | Blob;
  image_url?: string;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  format?: 'png' | 'jpg';
}

export interface RepositionRequest {
  image_file?: File | Blob;
  image_url?: string;
  scale?: string;
  position?: string;
  format?: 'png' | 'jpg';
}

export interface ProductBeautifierRequest {
  image_file?: File | Blob;
  image_url?: string;
  format?: 'png' | 'jpg';
}

export interface AnalyzeQARequest {
  image_file?: File | Blob;
  image_url?: string;
}

export interface AnalyzeQAResponse {
  issues?: string[];
  suggestions?: string[];
  crop_suggestions?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  ratio_suggestions?: {
    width: number;
    height: number;
  };
}
