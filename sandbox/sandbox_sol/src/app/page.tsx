"use client";

import { useOkoSol } from "@/hooks/use_oko_sol";
import { WalletStatus } from "@/components/wallet_status";
import { SignMessageWidget } from "@/components/sign_message_widget";
import { SignTransactionWidget } from "@/components/sign_transaction_widget";
import styles from "./page.module.css";

export default function Home() {
  const {
    isInitialized,
    isInitializing,
    isConnected,
    publicKey,
    error,
    connect,
    disconnect,
  } = useOkoSol();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Sandbox SOL</h1>
          <p className={styles.subtitle}>Oko Wallet Solana SDK Testing</p>
        </header>

        <div className={styles.content}>
          <WalletStatus
            isInitialized={isInitialized}
            isInitializing={isInitializing}
            isConnected={isConnected}
            publicKey={publicKey}
            error={error}
            onConnect={connect}
            onDisconnect={disconnect}
          />

          {isConnected && (
            <div className={styles.widgets}>
              <SignMessageWidget />
              <SignTransactionWidget />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
