import React, { type ReactElement } from "react";
import { Typography } from "@oko-wallet/ewallet-common-ui/typography";
import { Tooltip } from "@oko-wallet/ewallet-common-ui/tooltip";

import styles from "./address_row.module.scss";

export const AddressRow: React.FC<AddressRowProps> = ({
  icon,
  chain,
  address,
}) => {
  const isLoggedIn = !!address;
  const label = chain === "ethereum" ? "Ethereum" : "Cosmos Hub";
  const prefix = chain === "ethereum" ? "0x" : "cosmos1";

  const renderChainLabel = () => (
    <div className={isLoggedIn ? styles.chainLabelChip : styles.chainLabel}>
      {icon}
      <Typography tagType="span" size="xs" weight="semibold" color="secondary">
        {label}
      </Typography>
    </div>
  );

  const renderAddressContent = () => {
    if (isLoggedIn) {
      return (
        <Typography
          tagType="span"
          size="sm"
          weight="medium"
          color="disabled"
          className={styles.address}
        >
          {address}
        </Typography>
      );
    }

    return (
      <Tooltip title="Login to see details" placement="bottom">
        <div className={styles.placeholderContent}>
          <Typography tagType="span" size="md" weight="medium" color="disabled">
            {prefix}
          </Typography>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.dot} />
          ))}
        </div>
      </Tooltip>
    );
  };

  return (
    <div
      className={`${styles.container} ${isLoggedIn ? styles.loggedIn : styles.loggedOut}`}
    >
      {renderChainLabel()}
      <div className={styles.addressContent}>{renderAddressContent()}</div>
    </div>
  );
};

export interface AddressRowProps {
  icon: ReactElement;
  chain: "ethereum" | "cosmos";
  address?: string;
}
