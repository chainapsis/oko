import { create } from "zustand";
import { combine } from "zustand/middleware";

interface UserInfoState {
  email: string | null;
  publicKey: string | null;
  isSignedIn: boolean;
}

interface UserInfoActions {
  setUserInfo: (info: {
    email: string | null;
    publicKey: string | null;
  }) => void;
  clearUserInfo: () => void;
}

export const useUserInfoState = create(
  combine<UserInfoState, UserInfoActions>(
    {
      email: null,
      publicKey: null,
      isSignedIn: false,
    },
    (set) => ({
      setUserInfo: (info) => {
        set({
          email: info.email,
          publicKey: info.publicKey,
          isSignedIn: !!(info.email && info.publicKey),
        });
      },
      clearUserInfo: () => {
        set({
          email: null,
          publicKey: null,
          isSignedIn: false,
        });
      },
    }),
  ),
);
