export interface LoginState {
  user: UserState | null;
  token: string | null;
  isHydrated: boolean;
}

export interface LoginActions {
  setUserState: (user: UserState, token: string) => void;
  resetUserState: () => void;
}

export interface UserState {
  user_id: string;
  role: string;
  email: string;
}
