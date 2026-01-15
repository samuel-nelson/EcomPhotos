import { create } from 'zustand';
import { ImageFile, EditState, ProcessingQueueItem } from '@/types';

interface ImageStore {
  images: ImageFile[];
  selectedImages: string[];
  processingQueue: ProcessingQueueItem[];
  addImages: (images: ImageFile[]) => void;
  removeImage: (id: string) => void;
  updateImage: (id: string, updates: Partial<ImageFile>) => void;
  selectImage: (id: string) => void;
  deselectImage: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  clearImages: () => void;
  addToQueue: (item: ProcessingQueueItem) => void;
  updateQueueItem: (id: string, updates: Partial<ProcessingQueueItem>) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
}

export const useImageStore = create<ImageStore>((set) => ({
  images: [],
  selectedImages: [],
  processingQueue: [],
  
  addImages: (newImages) => set((state) => ({
    images: [...state.images, ...newImages],
  })),
  
  removeImage: (id) => set((state) => ({
    images: state.images.filter(img => img.id !== id),
    selectedImages: state.selectedImages.filter(imgId => imgId !== id),
  })),
  
  updateImage: (id, updates) => set((state) => ({
    images: state.images.map(img => 
      img.id === id ? { ...img, ...updates } : img
    ),
  })),
  
  selectImage: (id) => set((state) => ({
    selectedImages: state.selectedImages.includes(id)
      ? state.selectedImages
      : [...state.selectedImages, id],
  })),
  
  deselectImage: (id) => set((state) => ({
    selectedImages: state.selectedImages.filter(imgId => imgId !== id),
  })),
  
  selectAll: () => set((state) => ({
    selectedImages: state.images.map(img => img.id),
  })),
  
  deselectAll: () => set(() => ({
    selectedImages: [],
  })),
  
  clearImages: () => set(() => ({
    images: [],
    selectedImages: [],
  })),
  
  addToQueue: (item) => set((state) => ({
    processingQueue: [...state.processingQueue, item],
  })),
  
  updateQueueItem: (id, updates) => set((state) => ({
    processingQueue: state.processingQueue.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ),
  })),
  
  removeFromQueue: (id) => set((state) => ({
    processingQueue: state.processingQueue.filter(item => item.id !== id),
  })),
  
  clearQueue: () => set(() => ({
    processingQueue: [],
  })),
}));
