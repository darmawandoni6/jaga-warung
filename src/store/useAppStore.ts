import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import type { StoreProfile } from '@/types/settings';

export interface AppState {
  isPrinterEnabled: boolean;
  storeProfile: StoreProfile;
  lastBackupDate: string | null;
  setPrinterEnabled: (enabled: boolean) => void;
  updateStoreProfile: (profile: Partial<StoreProfile>) => void;
  setLastBackupDate: (date: string) => void;
}

const DEFAULT_STORE_PROFILE: StoreProfile = {
  name: 'Warung Berkah',
  phone: '0812-3456-7890',
  address: 'Jl. Merdeka No. 12, Jakarta',
  receiptFooter: 'Terima kasih atas kunjungan Anda!',
};

export const useAppStore = create<AppState>()(
  immer(set => ({
    isPrinterEnabled: false,
    storeProfile: DEFAULT_STORE_PROFILE,
    lastBackupDate: null,
    setPrinterEnabled: enabled =>
      set(state => {
        state.isPrinterEnabled = enabled;
      }),
    updateStoreProfile: profile =>
      set(state => {
        state.storeProfile = { ...state.storeProfile, ...profile };
      }),
    setLastBackupDate: date =>
      set(state => {
        state.lastBackupDate = date;
      }),
  })),
);
