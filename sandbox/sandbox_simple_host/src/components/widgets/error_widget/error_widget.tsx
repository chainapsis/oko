import { useState, type FC } from "react";

import { Widget } from "../widget_components";
import styles from "./error_widget.module.scss";
import { useOko } from "@/hooks/use_oko";
import type { OkoWalletMsgOpenModal } from "@oko-wallet/oko-sdk-core";

export const ErrorWidget: FC<LoginWidgetProps> = () => {
  const { okoCosmos } = useOko();
  const [_isSigningIn, setIsSigningIn] = useState(false);

  const handleClickError = async () => {
    try {
      if (okoCosmos) {
        setIsSigningIn(true);

        const okoWallet = okoCosmos.okoWallet;

        const invalidMsg = {
          target: "oko_attached",
          msg_type: "open_modal",
          payload: {
            modal_type: "eth/make_signature",
            modal_id: "123",
            data: {},
          },
        } as unknown as OkoWalletMsgOpenModal;

        okoWallet.openModal(invalidMsg);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <Widget>
      <div className={styles.container}>
        <div className={styles.title}>Trigger an error</div>
        <button onClick={handleClickError}>Error</button>
        {/* <div className={styles.walletBoxRow}>123</div> */}
      </div>
    </Widget>
  );
};

export interface LoginWidgetProps {}
