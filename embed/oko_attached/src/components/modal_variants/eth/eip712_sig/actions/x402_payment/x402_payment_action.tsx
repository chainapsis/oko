import { Fragment, type FC } from "react";
import { Spacing } from "@oko-wallet/oko-common-ui/spacing";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { Skeleton } from "@oko-wallet/oko-common-ui/skeleton";
import { ArrowUpRightIcon } from "@oko-wallet/oko-common-ui/icons/arrow_up_right";
import { createPublicClient, getAddress, http, stringify } from "viem";
import type { TypedDataDefinition, Address, Chain } from "viem";

import styles from "./x402_payment_action.module.scss";
import { Collapsible } from "@oko-wallet-attached/components/collapsible/collapsible";
import { Avatar } from "@oko-wallet-attached/components/avatar/avatar";
import { useGetTokenMetadata } from "@oko-wallet-attached/web3/ethereum/queries";
import { formatTokenAmount } from "@oko-wallet-attached/web3/ethereum/utils";
import { MakeSignatureRawCodeBlock } from "@oko-wallet-attached/components/modal_variants/common/make_signature/make_sig_modal_code_block";

export interface X402PaymentActionProps {
  from: Address;
  to: Address;
  value: string | bigint;
  validBefore: string | bigint;
  tokenAddress: Address;
  typedData: TypedDataDefinition;
  chain: Chain;
  tokenLogoURI?: string;
}

export const X402PaymentAction: FC<X402PaymentActionProps> = ({
  from,
  to,
  value,
  validBefore,
  tokenAddress,
  typedData,
  chain,
  tokenLogoURI,
}) => {
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  const blockExplorerUrl = chain.blockExplorers?.default.url;

  const { data: getTokenMetadataResult, isLoading: isTokenMetadataLoading } =
    useGetTokenMetadata({
      tokenAddress: tokenAddress,
      isERC20: true,
      client: publicClient,
    });

  const tokenMetadata = {
    name: getTokenMetadataResult?.name ?? undefined,
    symbol: getTokenMetadataResult?.symbol ?? undefined,
    decimals: getTokenMetadataResult?.decimals ?? undefined,
  };

  const formatted = formatTokenAmount(BigInt(value), tokenMetadata);

  function handleOpenExplorerLink(address: Address) {
    if (blockExplorerUrl) {
      window.open(`${blockExplorerUrl}/address/${address}`, "_blank");
    }
  }

  function formatAddress(address: Address): string {
    const normalizedAddress = getAddress(address);
    return `${normalizedAddress.slice(0, 6)}...${normalizedAddress.slice(-4)}`;
  }

  function formatExpiration(timestamp: string | bigint): string {
    const ts = Number(timestamp);
    if (ts === 0) return "No expiration";
    const date = new Date(ts * 1000);
    return date.toLocaleString();
  }

  return (
    <Fragment>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.x402Badge}>x402 Payment</span>
        </div>

        <div className={styles.amountContainer}>
          <Typography color="tertiary" size="xs" weight="medium">
            Amount
          </Typography>
          {isTokenMetadataLoading ? (
            <div className={styles.amountRow}>
              <Skeleton width="80px" height="28px" />
              <Skeleton width="40px" height="20px" />
            </div>
          ) : (
            <div className={styles.amountRow}>
              <Avatar
                src={tokenLogoURI}
                alt={tokenMetadata?.name ?? "unknown"}
                size="sm"
                variant="rounded"
              />
              <span className={styles.amount}>{formatted.display}</span>
              <span className={styles.tokenSymbol}>
                {tokenMetadata.symbol ?? ""}
              </span>
            </div>
          )}
        </div>

        <div className={styles.detailsContainer}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>From</span>
            {blockExplorerUrl ? (
              <span
                className={styles.addressLink}
                onClick={() => handleOpenExplorerLink(from)}
              >
                {formatAddress(from)}
                <ArrowUpRightIcon className={styles.arrowIcon} />
              </span>
            ) : (
              <span className={styles.detailValue}>{formatAddress(from)}</span>
            )}
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>To</span>
            {blockExplorerUrl ? (
              <span
                className={styles.addressLink}
                onClick={() => handleOpenExplorerLink(to)}
              >
                {formatAddress(to)}
                <ArrowUpRightIcon className={styles.arrowIcon} />
              </span>
            ) : (
              <span className={styles.detailValue}>{formatAddress(to)}</span>
            )}
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Expires</span>
            <span className={styles.detailValue}>
              {formatExpiration(validBefore)}
            </span>
          </div>
        </div>
      </div>

      <Spacing height={12} />
      <Collapsible title="Message" className={styles.collapsibleCodeBlock}>
        <MakeSignatureRawCodeBlock code={stringify(typedData, null, 2)} />
      </Collapsible>
    </Fragment>
  );
};
