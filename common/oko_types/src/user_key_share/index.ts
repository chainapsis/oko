import type { Bytes32 } from "@oko-wallet/bytes";

export interface RunExpandSharesResult {
  t: number;
  reshared_user_key_shares: UserKeySharePointByNode[];
  original_secret: Bytes32;
}
export interface NodeNameAndEndpoint {
  name: string;
  endpoint: string;
}

export interface UserKeySharePointByNode {
  node: NodeNameAndEndpoint;
  share: Point256;
}

export interface Point256 {
  x: Bytes32;
  y: Bytes32;
}

export interface PointNumArr {
  x: number[];
  y: number[];
}
