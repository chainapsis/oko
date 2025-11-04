import styles from "./page.module.scss";
import { KeplrEWalletProvider } from "@oko-wallet-demo-web/components/ewallet_provider/ewallet_provider";
import { GlobalHeader } from "@oko-wallet-demo-web/components/global_header/global_header";
import { LeftBar } from "@oko-wallet-demo-web/components/left_bar/left_bar";
import { PreviewPanel } from "@oko-wallet-demo-web/components/preview_panel/preview_panel";
import { QueryClientProvider } from "@oko-wallet-demo-web/components/query_client_provider/query_client_provider";

export default function Home() {
  return (
    <KeplrEWalletProvider>
      <QueryClientProvider>
        <div className={styles.wrapper}>
          <GlobalHeader />
          <div className={styles.body}>
            <LeftBar />
            <PreviewPanel />
          </div>
        </div>
      </QueryClientProvider>
    </KeplrEWalletProvider>
  );
}
