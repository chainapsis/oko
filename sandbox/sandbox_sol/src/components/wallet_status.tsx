"use client";

import styles from "./wallet_status.module.css";

interface WalletStatusProps {
  isInitialized: boolean;
  isInitializing: boolean;
  isConnected: boolean;
  publicKey: string | null;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function WalletStatus({
  isInitialized,
  isInitializing,
  isConnected,
  publicKey,
  error,
  onConnect,
  onDisconnect,
}: WalletStatusProps) {
  const getStatus = () => {
    if (isInitializing) return { text: "Initializing...", className: styles.pending };
    if (!isInitialized) return { text: "Not Initialized", className: styles.pending };
    if (isConnected) return { text: "Connected", className: styles.success };
    return { text: "Ready", className: styles.ready };
  };

  const status = getStatus();

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>Wallet Status</h2>
        <div className={`${styles.status} ${status.className}`}>
          <span className={styles.dot} />
          {status.text}
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {isConnected && publicKey && (
        <div className={styles.info}>
          <label className={styles.label}>Public Key</label>
          <code className={styles.publicKey}>{publicKey}</code>
        </div>
      )}

      <div className={styles.actions}>
        {!isConnected ? (
          <button
            className={styles.connectButton}
            onClick={onConnect}
            disabled={!isInitialized || isInitializing}
          >
            {isInitializing ? "Initializing..." : "Connect Wallet"}
          </button>
        ) : (
          <button className={styles.disconnectButton} onClick={onDisconnect}>
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
}
