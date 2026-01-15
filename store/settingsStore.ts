import { create } from 'zustand';
import { ExportSettings, NamingPattern } from '@/types';

interface SettingsStore {
  exportSettings: ExportSettings;
  namingPattern: NamingPattern;
  updateExportSettings: (settings: Partial<ExportSettings>) => void;
  updateNamingPattern: (pattern: Partial<NamingPattern>) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  exportSettings: {
    format: 'jpeg',
    quality: 90,
    dimensions: {
      maintainAspectRatio: true,
    },
  },
  
  namingPattern: {
    sku: '',
    pattern: '{SKU}_{INDEX}',
    index: 0,
  },
  
  updateExportSettings: (settings) => set((state) => ({
    exportSettings: { ...state.exportSettings, ...settings },
  })),
  
  updateNamingPattern: (pattern) => set((state) => ({
    namingPattern: { ...state.namingPattern, ...pattern },
  })),
}));
