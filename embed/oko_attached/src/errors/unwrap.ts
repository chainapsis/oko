import { useEffect } from "react";

import type { Result } from "@oko-wallet/stdlib-js";
import { useMemoryState } from "@oko-wallet-attached/store/memory";

import type { AppError } from ".";

export function useUnwrap(res: Result<any, AppError>) {
  const { setError } = useMemoryState();

  useEffect(() => {
    if (!res.success) {
      setError(res.err);
    }
  }, [res, setError]);
}
