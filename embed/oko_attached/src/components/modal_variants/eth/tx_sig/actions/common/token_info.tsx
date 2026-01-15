import type { AppCurrency } from "@keplr-wallet/types";
import type { FC } from "react";
import { type Address, type Chain, createPublicClient, http } from "viem";

import { Skeleton } from "@oko-wallet/oko-common-ui/skeleton";
import { Tooltip } from "@oko-wallet/oko-common-ui/tooltip";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { Avatar } from "@oko-wallet-attached/components/avatar/avatar";
import { useGetTokenMetadata } from "@oko-wallet-attached/web3/ethereum/queries";
import { formatTokenAmount } from "@oko-wallet-attached/web3/ethereum/utils";

import styles from "./token_info.module.scss";

export interface TokenInfoProps {
  tokenAddress?: Address;
  amount: bigint;
  chain?: Chain;
  currency?: AppCurrency;
}

export const TokenInfo: FC<TokenInfoProps> = ({
  tokenAddress,
  amount,
  chain,
  currency,
}) => {
  const publicClient = chain
    ? createPublicClient({
        chain,
        transport: http(),
      })
    : undefined;

  const { data: getTokenMetadataResult, isLoading: isTokenMetadataLoading } =
    useGetTokenMetadata({
      tokenAddress,
      client: publicClient,
      isERC20: true,
      options: {
        enabled: currency === undefined,
      },
    });

  const tokenImageURI = currency?.coinImageUrl ?? undefined;

  // NOTE: currency takes precedence over token metadata
  const tokenMetadata = {
    name:
      currency?.coinMinimalDenom ?? getTokenMetadataResult?.name ?? undefined,
    symbol: currency?.coinDenom ?? getTokenMetadataResult?.symbol ?? undefined,
    decimals:
      currency?.coinDecimals ?? getTokenMetadataResult?.decimals ?? undefined,
  };

  const formatted = formatTokenAmount(amount, tokenMetadata);

  if (isTokenMetadataLoading) {
    return <Skeleton width="125px" height="28px" />;
  }

  return (
    <div className={styles.tokenInfo}>
      <Avatar
        src={tokenImageURI}
        alt={tokenMetadata.name ?? "unknown"}
        size="sm"
        variant="rounded"
      />
      {formatted.isTruncated ? (
        <Tooltip content={formatted.full} placement="bottom">
          <Typography
            color="tertiary"
            size="sm"
            weight="medium"
            className={styles.tokenAmount}
          >
            {formatted.display}
          </Typography>
        </Tooltip>
      ) : (
        <Typography
          color="secondary"
          size="lg"
          weight="semibold"
          className={styles.tokenAmount}
        >
          {formatted.display}
        </Typography>
      )}
    </div>
  );
};
