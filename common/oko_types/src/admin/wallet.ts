export interface GetWalletListRequest {
  limit: number;
  offset: number;
}

export interface WalletWithEmailAndKSNodesResponse {
  public_key: string;
  email: string;
  auth_type: string;
  wallet_id: string;
  wallet_ks_nodes: string[];
}

export interface GetWalletListResponse {
  wallets: WalletWithEmailAndKSNodesResponse[];
  pagination: {
    total: number;
    current_page: number;
    total_pages: number;
  };
}
