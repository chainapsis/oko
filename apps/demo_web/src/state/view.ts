import { create } from "zustand";

interface ViewState {
  isLeftBarOpen: boolean;
  showIntegrationCard: boolean;
}

interface ViewAction {
  toggleLeftBarOpen: () => void;
  hideIntegrationCard: () => void;
}

export const useViewState = create<ViewState & ViewAction>((set) => ({
  isLeftBarOpen: false,
  showIntegrationCard: true,
  toggleLeftBarOpen: () => {
    set((state) => ({ isLeftBarOpen: !state.isLeftBarOpen }));
  },
  hideIntegrationCard: () => {
    set(() => ({ showIntegrationCard: false }));
  },
}));
