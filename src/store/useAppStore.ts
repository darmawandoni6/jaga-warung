import { create } from 'zustand';

export interface AppState {
  isPrinterEnabled: boolean;
  setPrinterEnabled: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>(set => ({
  isPrinterEnabled: false,
  setPrinterEnabled: isPrinterEnabled => set({ isPrinterEnabled }),
}));
