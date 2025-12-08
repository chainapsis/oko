import { FC, useMemo, useState } from "react";
import { Typography } from "@oko-wallet-common-ui/typography/typography";
import { CopyOutlinedIcon } from "@oko-wallet-common-ui/icons/copy_outlined";
import { CheckCircleOutlinedIcon } from "@oko-wallet-common-ui/icons/check_circle_outlined";

import styles from "./address_chip.module.scss";

interface AddressChipProps {
  address: string;
  isEthereumAddress: boolean;
  className?: string;
}

export const AddressChip: FC<AddressChipProps> = ({
  address,
  isEthereumAddress,
  className,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const displayAddress = useMemo(() => {
    if (!address) {
      return { former: "", middle: "", latter: "" };
    }

    const LENGTH_OF_FIRST_PART = 10;
    const LENGTH_OF_LAST_PART = 6;

    if (isEthereumAddress) {
      return {
        former: address.slice(0, LENGTH_OF_FIRST_PART),
        middle: address.slice(
          LENGTH_OF_FIRST_PART,
          address.length - LENGTH_OF_LAST_PART,
        ),
        latter: address.slice(address.length - LENGTH_OF_LAST_PART),
      };
    }
    return {
      former: address.slice(0, LENGTH_OF_FIRST_PART),
      middle: address.slice(
        LENGTH_OF_FIRST_PART,
        address.length - LENGTH_OF_LAST_PART,
      ),
      latter: address.slice(address.length - LENGTH_OF_LAST_PART),
    };
  }, [address]);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(address);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  return (
    <div
      className={`${styles.container} ${className || ""}`}
      onClick={handleCopy}
    >
      <div className={styles.addressText}>
        <Typography size="sm" className={styles.former}>
          {displayAddress.former}
        </Typography>
        <Typography size="sm" className={styles.middle}>
          {displayAddress.middle}
        </Typography>
        <Typography size="sm" className={styles.latter}>
          {displayAddress.latter}
        </Typography>
      </div>

      <div className={styles.iconContainer}>
        {isCopied ? (
          <CheckCircleOutlinedIcon
            size={16}
            color="var(--fg-success-primary)"
          />
        ) : (
          <CopyOutlinedIcon size={16} color="var(--fg-tertiary)" />
        )}
      </div>
    </div>
  );
};
