import type { SignInType } from "@oko-wallet-sdk-core/types/oauth";

export type SignInModalTheme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export interface SignInModalOptions {
  onSelect: (provider: SignInType) => Promise<void>;
  onClose?: () => void;
  theme?: SignInModalTheme;
}

export interface ProgressState {
  status: "loading" | "failed";
  provider: SignInType;
}
