import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";

import { paths } from "@oko-wallet-ct-dashboard/paths";
import { PASSWORD_MIN_LENGTH } from "@oko-wallet-ct-dashboard/constants";
import { requestChangePassword } from "@oko-wallet-ct-dashboard/fetch/users";
import { useAppState } from "@oko-wallet-ct-dashboard/state";

export type ResetPasswordInputs = {
  originalPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function useResetPasswordForm() {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isValid },
  } = useForm<ResetPasswordInputs>({
    resolver: resetPasswordResolver,
    mode: "onTouched",
  });

  const router = useRouter();

  const user = useAppState((state) => state.user);
  const token = useAppState((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<ResetPasswordInputs> = async (data) => {
    setIsLoading(true);

    try {
      const result = await requestChangePassword(
        user?.email ?? "",
        data.originalPassword,
        data.newPassword,
        token ?? "",
      );

      if (result.success) {
        reset();
        alert("Password changed successfully"); // TODO: toast로 변경
        router.push(paths.home);
      } else {
        if (result.code === "ORIGINAL_PASSWORD_INCORRECT") {
          setError("originalPassword", {
            message: "Current password is incorrect",
          });
        } else {
          setError("root", {
            message: result.msg || "Failed to verify account",
          });
        }
      }
    } catch (error: any) {
      console.error("error", error);
      setError("root", { message: "Failed to change password" });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    onSubmit: handleSubmit(onSubmit),
    register,
    errors,
    isLoading,
    isValid,
  };
}

function resetPasswordResolver(values: ResetPasswordInputs) {
  const errors: Record<string, any> = {};

  if (!values.originalPassword) {
    errors.originalPassword = {
      type: "required",
      message: "Password is required",
    };
  }

  if (!values.newPassword) {
    errors.newPassword = { type: "required", message: "Password is required" };
  } else if (values.newPassword.length < PASSWORD_MIN_LENGTH) {
    errors.newPassword = {
      type: "minLength",
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    };
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = {
      type: "required",
      message: "Please confirm your password",
    };
  } else if (values.newPassword !== values.confirmPassword) {
    errors.confirmPassword = {
      type: "validate",
      message: "Passwords do not match",
    };
  }

  return {
    values: values,
    errors: errors,
  } as any;
}
