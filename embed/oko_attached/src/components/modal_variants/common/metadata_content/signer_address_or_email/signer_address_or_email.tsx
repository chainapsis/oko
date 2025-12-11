import { useState, type FC } from "react";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { EyeIcon } from "@oko-wallet/oko-common-ui/icons/eye";

import { useAppState } from "@oko-wallet-attached/store/app";
import styles from "./signer_address_or_email.module.scss";

interface SignerAddressOrEmailProps {
  signer: string;
  origin: string;
  initialViewType?: "View Address" | "Login Info";
}

interface ViewProps {
  value: string;
  origin: string;
  type: "address" | "email";
  prefix?: string;
}

export const SignerAddressOrEmailView: FC<ViewProps> = ({
  value,
  type,
  origin,
  prefix,
}) => {
  const email = useAppState((state) => state.getWallet(origin)?.email);
  const displayValue =
    type === "address" ? `${value.slice(0, 9)}...${value.slice(-9)}` : email;

  return (
    <Typography size="sm" color="brand-tertiary" weight="medium">
      {prefix && `${prefix} `}
      {displayValue}
    </Typography>
  );
};

export const SignerAddressOrEmailChangeViewTypeButton: FC<{
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

export const SignerAddressOrEmail: FC<SignerAddressOrEmailProps> = ({
  signer,
  origin,
  initialViewType = "View Address",
}) => {
  const [viewType, setViewType] = useState<"View Address" | "Login Info">(
    initialViewType,
  );

  switch (viewType) {
    case "View Address":
      return (
        <div className={styles.wrapper}>
          <SignerAddressOrEmailView
            value={signer}
            type="address"
            origin={origin}
          />
          <SignerAddressOrEmailChangeViewTypeButton
            viewType="Login Info"
            onClick={() => setViewType("Login Info")}
          />
        </div>
      );
    case "Login Info":
      return (
        <div className={styles.wrapper}>
          <SignerAddressOrEmailView
            value={signer}
            type="email"
            origin={origin}
          />
          <SignerAddressOrEmailChangeViewTypeButton
            viewType="View Address"
            onClick={() => setViewType("View Address")}
          />
        </div>
      );
  }
};
