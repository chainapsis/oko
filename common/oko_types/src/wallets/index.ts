import type { CurveType } from "../crypto/index";

export type WalletStatus = "ACTIVE" | "INACTIVE";

export type Wallet = {
  wallet_id: string;
  user_id: string;
  curve_type: CurveType;
  public_key: Buffer;
  status: WalletStatus;
  enc_tss_share: Buffer;
  sss_threshold: number;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
};

export type CreateWalletRequest = {
  user_id: string;
  curve_type: CurveType;
  public_key: Buffer;
  status: WalletStatus;
  enc_tss_share: Buffer;
  sss_threshold: number;
};

export type WalletWithEmail = Wallet & {
  email: string;
};

export type WalletWithEmailAndKSNodes = Wallet & {
  email: string;
  auth_type: string;
  wallet_ks_nodes: string[];
};
