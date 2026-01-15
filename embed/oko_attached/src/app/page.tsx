import { Home } from "@oko-wallet-attached/components/home/home";
import { AttachedInitialized } from "@oko-wallet-attached/components/attached_initialized/attached_initialized";

export default function Page() {
  return (
    <AttachedInitialized>
      <Home />
    </AttachedInitialized>
  );
}
