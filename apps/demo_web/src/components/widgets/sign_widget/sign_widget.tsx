import React, { type ReactElement, useState, useRef, useEffect } from "react";
import { Button } from "@oko-wallet/oko-common-ui/button";
import { InfoCircleIcon } from "@oko-wallet/oko-common-ui/icons/info_circle";
import { LoadingIcon } from "@oko-wallet/oko-common-ui/icons/loading";
import { CheckCircleOutlinedIcon } from "@oko-wallet/oko-common-ui/icons/check_circle_outlined";
import { Typography } from "@oko-wallet/oko-common-ui/typography";

import { Widget } from "@oko-wallet-demo-web/components/widgets/widget_components";
import styles from "./sign_widget.module.scss";

type SignStep = "initial" | "loading" | "success" | "error";

export const SignWidget: React.FC<SignWidgetProps> = ({
  chain,
  chainIcon,
  signType,
  signButtonOnClick,
  renderBottom,
}) => {
  const [signResult, setSignResult] = useState<SignStep>("initial");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const signTitle =
    signType === "offchain"
      ? "Sign an Offchain Message"
      : "Sign an Onchain Message";

  const handleSignClick = async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setSignResult("loading");

    try {
      await signButtonOnClick();
      setSignResult("success");
      timeoutRef.current = setTimeout(() => {
        setSignResult("initial");
      }, 2000);
    } catch (error) {
      console.error("Sign failed:", error);
      setSignResult("initial");
    }
  };

  return (
    <Widget>
      <div className={styles.container}>
        <div className={styles.titleRow}>
          <div className={styles.chainBadge}>
            {chainIcon}
            <Typography
              tagType="span"
              size="xs"
              weight="semibold"
              color="secondary"
            >
              {chain}
            </Typography>
          </div>
          <Typography
            tagType="span"
            size="sm"
            weight="semibold"
            color="secondary"
            className={styles.titleText}
          >
            {signTitle}
          </Typography>
        </div>

        {signResult === "loading" ? (
          <div className={styles.loadingWrapper}>
            <div className={styles.loadingContent}>
              <LoadingIcon
                className={styles.loadingIcon}
                color="var(--fg-brand-primary)"
                backgroundColor="var(--bg-tertiary)"
              />
              <div className={styles.loadingText}>Processing...</div>
            </div>
          </div>
        ) : signResult === "success" ? (
          <div className={styles.resultWrapper}>
            <div className={styles.resultIconWrapper}>
              <CheckCircleOutlinedIcon color="var(--fg-success-primary)" />
            </div>
            <div className={styles.resultText}>Success!</div>
          </div>
        ) : (
          <Description signType={signType} />
        )}

        {(signResult === "initial" || signResult === "loading") && (
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={handleSignClick}
            disabled={signResult === "loading"}
          >
            Sign
          </Button>
        )}
      </div>

      {renderBottom?.()}
    </Widget>
  );
};

const Description = ({ signType }: { signType: SignType }) => {
  return (
    <>
      {signType === "offchain" && (
        <div className={styles.infoBox}>
          <div className={styles.infoParagraph}>
            <InfoCircleIcon />
            <Typography size="sm" weight="semibold" color="tertiary">
              Why use offchain signatures?
            </Typography>
          </div>

          <ul className={styles.infoList}>
            <li>
              <Typography size="sm" weight="medium" color="tertiary">
                Prove wallet ownership
              </Typography>
            </li>
            <li>
              <Typography size="sm" weight="medium" color="tertiary">
                Authenticate without gas fees
              </Typography>
            </li>
            <li>
              <Typography size="sm" weight="medium" color="tertiary">
                No transaction is sent on-chain
              </Typography>
            </li>
          </ul>
        </div>
      )}
      {signType === "onchain" && (
        <Typography
          tagType="div"
          size="sm"
          weight="medium"
          color="tertiary"
          className={styles.onchainTest}
        >
          <p>This is a demo ✨</p>
          <p>No transaction will be sent on-chain.</p>
        </Typography>
      )}
    </>
  );
};

export interface SignWidgetProps {
  chain: string;
  chainIcon: ReactElement;
  signType: SignType;
  signButtonOnClick: () => Promise<void>;
  renderBottom?: () => ReactElement;
}

type SignType = "offchain" | "onchain";
