import {
  PhotoRoomApiResponse,
  BackgroundRemoveRequest,
  AIBackgroundRequest,
  PhotoFixRequest,
  RepositionRequest,
  ProductBeautifierRequest,
  AnalyzeQARequest,
  AnalyzeQAResponse,
} from './types';

const PHOTOROOM_API_BASE = 'https://sdk.photoroom.com/v1';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

class PhotoRoomClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async retryRequest<T>(
    fn: () => Promise<T>,
    retries = MAX_RETRIES
  ): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      if (retries > 0 && (error.status === 429 || error.status >= 500)) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return this.retryRequest(fn, retries - 1);
      }
      throw error;
    }
  }

  private async makeRequest(
    endpoint: string,
    formData: FormData
  ): Promise<PhotoRoomApiResponse> {
    return this.retryRequest(async () => {
      const response = await fetch(`${PHOTOROOM_API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          message: error.message || response.statusText,
          ...error,
        };
      }

      return response.json();
    });
  }

  private createFormData(
    file?: File | Blob,
    url?: string,
    params?: Record<string, any>
  ): FormData {
    const formData = new FormData();
    
    if (file) {
      formData.append('image_file', file);
    } else if (url) {
      formData.append('image_url', url);
    }

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
    }

    return formData;
  }

  async removeBackground(
    request: BackgroundRemoveRequest
  ): Promise<PhotoRoomApiResponse> {
    const formData = this.createFormData(request.image_file, request.image_url, {
      format: request.format || 'png',
      crop: request.crop,
      crop_margin: request.crop_margin,
      scale: request.scale,
      position: request.position,
    });

    return this.makeRequest('/segment', formData);
  }

  async generateAIBackground(
    request: AIBackgroundRequest
  ): Promise<PhotoRoomApiResponse> {
    const formData = this.createFormData(request.image_file, request.image_url, {
      prompt: request.prompt,
      negative_prompt: request.negative_prompt,
      format: request.format || 'png',
      scale: request.scale,
    });

    return this.makeRequest('/segment', formData);
  }

  async photoFix(request: PhotoFixRequest): Promise<PhotoRoomApiResponse> {
    const formData = this.createFormData(request.image_file, request.image_url, {
      brightness: request.brightness,
      contrast: request.contrast,
      saturation: request.saturation,
      format: request.format || 'png',
    });

    return this.makeRequest('/segment', formData);
  }

  async reposition(request: RepositionRequest): Promise<PhotoRoomApiResponse> {
    const formData = this.createFormData(request.image_file, request.image_url, {
      scale: request.scale,
      position: request.position,
      format: request.format || 'png',
    });

    return this.makeRequest('/segment', formData);
  }

  async beautifyProduct(
    request: ProductBeautifierRequest
  ): Promise<PhotoRoomApiResponse> {
    const formData = this.createFormData(request.image_file, request.image_url, {
      format: request.format || 'png',
    });

    return this.makeRequest('/segment', formData);
  }

  async analyzeQA(request: AnalyzeQARequest): Promise<AnalyzeQAResponse> {
    const formData = this.createFormData(request.image_file, request.image_url);
    
    return this.retryRequest(async () => {
      const response = await fetch(`${PHOTOROOM_API_BASE}/segment`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          message: error.message || response.statusText,
          ...error,
        };
      }

      return response.json();
    });
  }

  async checkJobStatus(jobId: string): Promise<PhotoRoomApiResponse> {
    return this.retryRequest(async () => {
      const response = await fetch(`${PHOTOROOM_API_BASE}/segment/${jobId}`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          message: error.message || response.statusText,
          ...error,
        };
      }

      return response.json();
    });
  }
}

let clientInstance: PhotoRoomClient | null = null;

export function getPhotoRoomClient(): PhotoRoomClient {
  if (!clientInstance) {
    const apiKey = process.env.PHOTOROOM_API_KEY;
    if (!apiKey) {
      throw new Error('PHOTOROOM_API_KEY is not set');
    }
    clientInstance = new PhotoRoomClient(apiKey);
  }
  return clientInstance;
}

export { PhotoRoomClient };
