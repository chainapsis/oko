import { useState, type FC } from "react";

import { Widget } from "../widget_components";
import styles from "./login_widget.module.scss";
import { useOko } from "@/hooks/use_oko";
import { useUserInfoState } from "@/state/user_info";
import { useAddresses } from "@/hooks/use_addresses";
import { CosmosAccountsModal } from "@/components/cosmos_accounts_modal/cosmos_accounts_modal";

export const LoginWidget: FC<LoginWidgetProps> = () => {
  const { okoCosmos } = useOko();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const { isSignedIn, email, publicKey } = useUserInfoState();
  const { cosmosAddress, ethAddress } = useAddresses();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSignIn = async () => {
    try {
      if (okoCosmos) {
        setIsSigningIn(true);

        const okoWallet = okoCosmos.okoWallet;

        // TODO: @hyunjae
        okoWallet.signIn("google");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    if (okoCosmos) {
      await okoCosmos.okoWallet.signOut();
    }
  };

  if (isSigningIn) {
    return (
      <Widget>
        <div className={styles.signingInWrapper}>
          <div className={styles.googleCircle}>google</div>
          <p>Signing in</p>
        </div>
      </Widget>
    );
  }

  if (isSignedIn) {
    return (
      <Widget>
        <div className={styles.loginInfoContainer}>
          <div className={styles.loginInfoRow}>
            <p className={styles.value}>{email}</p>
            <button className={styles.signOutButton} onClick={handleSignOut}>
              <p>Sign out</p>
            </button>
          </div>
          <div className={styles.publicKeyRow}>
            <p className={styles.label}>Public Key</p>
            <p className={styles.value}>{publicKey}</p>
          </div>
          <div className={styles.addressRow}>
            <p className={styles.label}>Eth Address</p>
            <p className={styles.value}>{ethAddress}</p>
          </div>
          <div className={styles.addressRow}>
            <p className={styles.label}>Cosmos Address</p>
            <p className={styles.value}>{cosmosAddress}</p>
          </div>

          <div className={styles.addressRow}>
            <p className={styles.label}>Cosmos Accounts</p>
            <button
              className={styles.signOutButton}
              onClick={() => setIsModalOpen(true)}
            >
              <p>View Cosmos Accounts</p>
            </button>
          </div>
        </div>
        <CosmosAccountsModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </Widget>
    );
  }

  return (
    <Widget>
      <div className={styles.container}>
        <div className={styles.logoWrapper}>logo</div>
        <button onClick={handleSignIn}>Google Login</button>
        <div className={styles.walletBoxRow}>
          {/* <WalletBox icon={<KeplrIcon />} label="Keplr" /> */}
          {/* <WalletBox icon={<MetamaskIcon />} label="Metamask" /> */}
          {/* <WalletBox icon={<LeapIcon />} label="Leap" /> */}
        </div>
      </div>
    </Widget>
  );
};

export interface LoginWidgetProps {}
