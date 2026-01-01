export interface TeddsaKeygenOutput {
  key_package: number[];
  public_key_package: number[];
  identifier: number[];
}

export interface TeddsaCentralizedKeygenOutput {
  private_key: number[];
  keygen_outputs: TeddsaKeygenOutput[];
  public_key: number[];
}

export interface TeddsaClientKeygenState {
  keygen_1: TeddsaKeygenOutput | null;
  keygen_2: TeddsaKeygenOutput | null;
  public_key: number[] | null;
}
