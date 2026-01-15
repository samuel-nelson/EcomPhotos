export interface FilterOptions {
  brightness?: number; // -100 to 100
  contrast?: number; // -100 to 100
  saturation?: number; // -100 to 100
  rotation?: number; // degrees
  whiteBalance?: {
    temperature: number; // -100 to 100 (cool to warm)
    tint: number; // -100 to 100 (green to magenta)
  };
}

export function applyFilters(
  image: HTMLImageElement | HTMLCanvasElement,
  filters: FilterOptions
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  canvas.width = image.width;
  canvas.height = image.height;

  // Apply rotation
  if (filters.rotation) {
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((filters.rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
  }

  ctx.drawImage(image, 0, 0);

  if (filters.rotation) {
    ctx.restore();
  }

  // Apply color filters
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Brightness
    if (filters.brightness !== undefined) {
      const brightness = (filters.brightness + 100) / 100;
      r = Math.min(255, r * brightness);
      g = Math.min(255, g * brightness);
      b = Math.min(255, b * brightness);
    }

    // Contrast
    if (filters.contrast !== undefined) {
      const contrast = (filters.contrast + 100) / 100;
      const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
      r = Math.min(255, Math.max(0, factor * (r - 128) + 128));
      g = Math.min(255, Math.max(0, factor * (g - 128) + 128));
      b = Math.min(255, Math.max(0, factor * (b - 128) + 128));
    }

    // Saturation
    if (filters.saturation !== undefined) {
      const saturation = (filters.saturation + 100) / 100;
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = Math.min(255, Math.max(0, gray + saturation * (r - gray)));
      g = Math.min(255, Math.max(0, gray + saturation * (g - gray)));
      b = Math.min(255, Math.max(0, gray + saturation * (b - gray)));
    }

    // White Balance (Temperature and Tint)
    if (filters.whiteBalance) {
      const { temperature, tint } = filters.whiteBalance;
      
      // Temperature adjustment (cool to warm)
      const temp = (temperature + 100) / 100;
      if (temp < 1) {
        // Cooler (more blue)
        r = r * (1 + (1 - temp) * 0.1);
        b = b * (1 + (1 - temp) * 0.2);
      } else {
        // Warmer (more red/yellow)
        r = r * (1 + (temp - 1) * 0.2);
        g = g * (1 + (temp - 1) * 0.1);
      }

      // Tint adjustment (green to magenta)
      const tintValue = (tint + 100) / 100;
      if (tintValue < 1) {
        // More green
        g = g * (1 + (1 - tintValue) * 0.1);
      } else {
        // More magenta
        r = r * (1 + (tintValue - 1) * 0.1);
        b = b * (1 + (tintValue - 1) * 0.1);
      }

      r = Math.min(255, Math.max(0, r));
      g = Math.min(255, Math.max(0, g));
      b = Math.min(255, Math.max(0, b));
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  ctx.putImageData(imageData, 0, 0);

  return canvas;
}
