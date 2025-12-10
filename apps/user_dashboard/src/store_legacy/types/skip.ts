export interface AssetsResponse {
  chain_to_assets_map: {
    [chainId: string]:
      | {
          assets: {
            denom: string;
            chain_id: string;
            origin_denom: string;
            origin_chain_id: string;
            trace: string;
            is_cw20: boolean;
            is_evm: boolean;
            is_svm: boolean;
            token_contract?: string;
            recommended_symbol?: string;
            decimals?: number;
            symbol: string;
            logo_uri?: string;
            coingecko_id?: string;
          }[];
        }
      | undefined;
  };
}
