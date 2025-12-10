import { create } from "zustand";
import {
  RootStore,
  createRootStore,
} from "@oko-wallet-user-dashboard/store_legacy/root";

interface StoreState {
  rootStore: RootStore;
}

export const useUserDashboardStore = create<StoreState>()(() => ({
  rootStore: createRootStore(),
}));

export const useRootStore = () =>
  useUserDashboardStore((state) => state.rootStore);
