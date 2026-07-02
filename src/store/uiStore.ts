import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  mobileNavOpen: boolean;
  commandPaletteOpen: boolean;
  activeWorkspaceId: string | null;
  setMobileNavOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setActiveWorkspace: (id: string | null) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      mobileNavOpen: false,
      commandPaletteOpen: false,
      activeWorkspaceId: null,
      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),
    }),
    {
      name: 'taskflow-ui',
      partialize: (state) => ({ activeWorkspaceId: state.activeWorkspaceId }),
    }
  )
);
