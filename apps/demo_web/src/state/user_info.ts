import type { AuthType } from "@oko-wallet/oko-types/auth";
import { create } from "zustand";
import { combine } from "zustand/middleware";

interface UserInfoState {
  authType: AuthType | null;
  email: string | null;
  publicKey: string | null;
  name: string | null;
  isSignedIn: boolean;
}

interface UserInfoActions {
  setUserInfo: (info: {
    authType: AuthType | null;
    email: string | null;
    publicKey: string | null;
    name?: string | null;
  }) => void;
  clearUserInfo: () => void;
}

export const useUserInfoState = create(
  combine<UserInfoState, UserInfoActions>(
    {
      authType: null,
      email: null,
      publicKey: null,
      name: null,
      isSignedIn: false,
    },
    (set) => ({
      setUserInfo: (info) => {
        set({
          authType: info.authType,
          email: info.email,
          publicKey: info.publicKey,
          name: info.name ?? null,
          isSignedIn: !!(info.email && info.publicKey),
        });
      },
      clearUserInfo: () => {
        set({
          authType: null,
          email: null,
          publicKey: null,
          name: null,
          isSignedIn: false,
        });
      },
    }),
  ),
);
