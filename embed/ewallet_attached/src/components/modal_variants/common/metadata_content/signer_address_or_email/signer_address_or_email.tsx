import { useState, type FC } from "react";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { EyeIcon } from "@oko-wallet/oko-common-ui/icons/eye";

import { useAppState } from "@oko-wallet-attached/store/app";
import styles from "./signer_address_or_email.module.scss";

interface SignerAddressOrEmailProps {
  signer: string;
  origin: string;
}

export const SignerAddressOrEmail: FC<SignerAddressOrEmailProps> = ({
  signer,
  origin,
}) => {
  const [viewType, setViewType] = useState<"View Address" | "Login Info">(
    "View Address",
  );
  const email = useAppState((state) => state.getWallet(origin)?.email);

  switch (viewType) {
    case "View Address":
      return (
        <div className={styles.wrapper}>
          <Typography size="sm" color="brand-tertiary" weight="medium">
            {signer.slice(0, 9)}...{signer.slice(-9)}
          </Typography>
          <ChangeViewTypeButton
            viewType="Login Info"
            onClick={() => setViewType("Login Info")}
          />
        </div>
      );
    case "Login Info":
      return (
        <div className={styles.wrapper}>
          <Typography size="sm" color="brand-tertiary" weight="medium">
            {email}
          </Typography>
          <ChangeViewTypeButton
            viewType="View Address"
            onClick={() => setViewType("View Address")}
          />
        </div>
      );
  }
};

const ChangeViewTypeButton: FC<{
  viewType: "View Address" | "Login Info";
  onClick: () => void;
}> = ({ viewType, onClick }) => {
  return (
    <div onClick={onClick} className={styles.changeViewTypeButton}>
      <EyeIcon size={12} color="var(--fg-quaternary)" />
      <Typography size="xs" color="quaternary" weight="semibold">
        {viewType}
      </Typography>
    </div>
  );
};
