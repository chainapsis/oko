import { useRouter } from "next/navigation";
import { useState } from "react";

import { SIX_DIGITS_REGEX } from "@oko-wallet-ct-dashboard/constants";
import { requestVerifyCodeAndLogin } from "@oko-wallet-ct-dashboard/fetch/users";
import { paths } from "@oko-wallet-ct-dashboard/paths";
import { useAppState } from "@oko-wallet-ct-dashboard/state";

export function useSignUpDigits() {
  const router = useRouter();
  const user = useAppState((state) => state.user);
  const setUser = useAppState((state) => state.setUser);
  const setToken = useAppState((state) => state.setToken);

  const [digits, setDigits] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateDigits = (value: string): boolean => {
    if (!value) {
      setError("Verification code is required");
      return false;
    }

    if (!SIX_DIGITS_REGEX.test(value)) {
      setError("Must be 6 digits");
      return false;
    }

    return true;
  };

  const handleDigitsChange = (value: string[]) => {
    setDigits(value);
    setError(null);
  };

  const handleComplete = async (value: string[]) => {
    const digits = value.join("");

    if (!validateDigits(digits)) {
      return;
    }

    if (!user?.email) {
      setError("Email not found");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const verificationResult = await requestVerifyCodeAndLogin(
        user.email,
        digits,
      );

      if (verificationResult.success) {
        setToken(verificationResult.data.token);
        setUser(verificationResult.data.customer);
        router.replace(paths.reset_password);
      } else {
        setError(verificationResult.msg || "Failed to verify code");
      }
    } catch (error: any) {
      setError(error.message || "Failed to verify code");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    digits,
    handleDigitsChange,
    handleComplete,
    isLoading,
    error,
    setError,
    user,
  };
}
