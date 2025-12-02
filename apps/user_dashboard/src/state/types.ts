export interface AppState {
  user: AppUser | null;
  token: string | null;
}

export interface AppActions {
  setUser: (user: AppUser) => void;
  resetUser: () => void;
  setToken: (token: string) => void;
  resetToken: () => void;
}

export interface AppUser {
  email: string;
  is_email_verified: boolean;
}
