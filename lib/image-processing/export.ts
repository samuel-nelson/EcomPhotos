import { ExportSettings } from '@/types';

export async function exportImage(
  canvas: HTMLCanvasElement,
  settings: ExportSettings,
  fileName: string
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      let quality = settings.quality / 100;

      if (settings.format === 'jpeg') {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to export JPEG'));
            }
          },
          'image/jpeg',
          quality
        );
      } else if (settings.format === 'png') {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to export PNG'));
            }
          },
          'image/png'
        );
      } else if (settings.format === 'webp') {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to export WebP'));
            }
          },
          'image/webp',
          quality
        );
      } else {
        reject(new Error(`Unsupported format: ${settings.format}`));
      }
    } catch (error) {
      reject(error);
    }
  });
}

export function downloadImage(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
