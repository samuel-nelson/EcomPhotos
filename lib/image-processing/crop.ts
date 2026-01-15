export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function cropImage(
  image: HTMLImageElement | HTMLCanvasElement,
  cropArea: CropArea
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  canvas.width = cropArea.width;
  canvas.height = cropArea.height;

  ctx.drawImage(
    image,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    cropArea.width,
    cropArea.height
  );

  return canvas;
}

export function getAspectRatioPresets() {
  return {
    '1:1': { width: 1, height: 1 },
    '4:3': { width: 4, height: 3 },
    '3:4': { width: 3, height: 4 },
    '16:9': { width: 16, height: 9 },
    '9:16': { width: 9, height: 16 },
    'free': null,
  };
}
