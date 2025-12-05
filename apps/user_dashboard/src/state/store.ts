import { create } from "zustand";
import {
  RootStore,
  createRootStore,
} from "@oko-wallet-user-dashboard/strores/root";

interface StoreState {
  rootStore: RootStore;
}

const useStore = create<StoreState>()(() => ({
  rootStore: createRootStore(),
}));

export const useRootStore = () => useStore((state) => state.rootStore);
