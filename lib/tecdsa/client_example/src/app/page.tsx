import styles from "./page.module.css";
import { WasmExample } from "../components/wasm_example/wasm_example";

export default function Home() {
  return (
    <div className={styles.page}>
      <WasmExample />
    </div>
  );
}
