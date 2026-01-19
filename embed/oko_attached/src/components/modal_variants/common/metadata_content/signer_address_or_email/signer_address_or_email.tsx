import { EyeIcon } from "@oko-wallet/oko-common-ui/icons/eye";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { type FC, useState } from "react";

import styles from "./signer_address_or_email.module.scss";
import { useAppState } from "@oko-wallet-attached/store/app";

interface SignerAddressOrEmailProps {
  signer: string;
  origin: string;
  initialViewType: "View Address" | "Login Info" | null;
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

interface SignerAddressOrEmailChangeViewTypeButtonProps {
  viewType: "View Address" | "Login Info";
  onClick: () => void;
}

export const SignerAddressOrEmailChangeViewTypeButton: FC<
  SignerAddressOrEmailChangeViewTypeButtonProps
> = ({ viewType, onClick }) => {
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
  initialViewType,
}) => {
  const [viewType, setViewType] = useState<
    "View Address" | "Login Info" | null
  >(initialViewType);

  switch (viewType) {
    case null:
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
