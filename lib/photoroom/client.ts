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

const PHOTOROOM_API_BASE = 'https://sdk.photoroom.com/v1/segment';
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
      const url = `${PHOTOROOM_API_BASE}${endpoint}`;
      console.log('PhotoRoom API Request:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
        },
        body: formData,
      });

      const responseText = await response.text();
      console.log('PhotoRoom API Response Status:', response.status);
      console.log('PhotoRoom API Response:', responseText.substring(0, 200));

      if (!response.ok) {
        let error: any = {};
        try {
          error = JSON.parse(responseText);
        } catch {
          error = { message: responseText || response.statusText };
        }
        throw {
          status: response.status,
          message: error.message || error.error || response.statusText,
          ...error,
        };
      }

      try {
        return JSON.parse(responseText);
      } catch {
        // If response is not JSON, might be base64 image
        return { result_b64: responseText };
      }
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

    return this.makeRequest('', formData);
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

    return this.makeRequest('', formData);
  }

  async photoFix(request: PhotoFixRequest): Promise<PhotoRoomApiResponse> {
    const formData = this.createFormData(request.image_file, request.image_url, {
      brightness: request.brightness,
      contrast: request.contrast,
      saturation: request.saturation,
      format: request.format || 'png',
    });

    return this.makeRequest('', formData);
  }

  async reposition(request: RepositionRequest): Promise<PhotoRoomApiResponse> {
    const formData = this.createFormData(request.image_file, request.image_url, {
      scale: request.scale,
      position: request.position,
      format: request.format || 'png',
    });

    return this.makeRequest('', formData);
  }

  async beautifyProduct(
    request: ProductBeautifierRequest
  ): Promise<PhotoRoomApiResponse> {
    const formData = this.createFormData(request.image_file, request.image_url, {
      format: request.format || 'png',
    });

    return this.makeRequest('', formData);
  }

  async analyzeQA(request: AnalyzeQARequest): Promise<AnalyzeQAResponse> {
    const formData = this.createFormData(request.image_file, request.image_url);
    
    return this.retryRequest(async () => {
      const response = await fetch(`${PHOTOROOM_API_BASE}`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
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
      const response = await fetch(`${PHOTOROOM_API_BASE}/${jobId}`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey,
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
    // Use environment variable if set, otherwise use the default sandbox key
    const apiKey = process.env.PHOTOROOM_API_KEY || 'sandbox_sk_pr_default_75c6297a874dad0b47cbc72b63ea050732686413';
    clientInstance = new PhotoRoomClient(apiKey);
  }
  return clientInstance;
}

export { PhotoRoomClient };
