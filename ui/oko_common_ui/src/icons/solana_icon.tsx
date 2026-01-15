import type { FC } from "react";

import { s3BucketURL } from "./paths";

export const SolanaIcon: FC<SolanaIconProps> = ({
  width = 16,
  height = 16,
}) => {
  return (
    <img
      src={`${s3BucketURL}/solana.png`}
      alt="solana_icon"
      width={width}
      height={height}
    />
  );
};

export interface SolanaIconProps {
  width?: number;
  height?: number;
}
