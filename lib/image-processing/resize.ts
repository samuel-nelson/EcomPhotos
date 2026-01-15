export interface ResizeOptions {
  width?: number;
  height?: number;
  maintainAspectRatio: boolean;
}

export function resizeImage(
  image: HTMLImageElement | HTMLCanvasElement,
  options: ResizeOptions
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  let { width, height } = options;

  if (options.maintainAspectRatio) {
    const aspectRatio = image.width / image.height;
    
    if (width && !height) {
      height = width / aspectRatio;
    } else if (height && !width) {
      width = height * aspectRatio;
    } else if (width && height) {
      // Use the dimension that requires less scaling
      const scaleX = width / image.width;
      const scaleY = height / image.height;
      const scale = Math.min(scaleX, scaleY);
      width = image.width * scale;
      height = image.height * scale;
    } else {
      width = image.width;
      height = image.height;
    }
  } else {
    width = width || image.width;
    height = height || image.height;
  }

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(image, 0, 0, width, height);

  return canvas;
}

export function getPresetSizes() {
  return {
    'Original': null,
    'Square (1000x1000)': { width: 1000, height: 1000 },
    'Instagram Post (1080x1080)': { width: 1080, height: 1080 },
    'Instagram Story (1080x1920)': { width: 1080, height: 1920 },
    'Facebook Post (1200x630)': { width: 1200, height: 630 },
    'Etsy Listing (2000x2000)': { width: 2000, height: 2000 },
    'Amazon Product (1000x1000)': { width: 1000, height: 1000 },
  };
}
