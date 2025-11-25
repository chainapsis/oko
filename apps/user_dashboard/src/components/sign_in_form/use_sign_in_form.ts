import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { paths } from "@oko-wallet-user-dashboard/paths";
import { requestSignIn } from "@oko-wallet-user-dashboard/fetch/users";
import { useAppState } from "@oko-wallet-user-dashboard/state";
import {
  EMAIL_REGEX,
  PASSWORD_MIN_LENGTH,
} from "@oko-wallet-user-dashboard/constants";

const REMEMBER_EMAIL_KEY = "remembered_email";

export type SignInInputs = {
  email: string;
  password: string;
};

const signInResolver: Resolver<SignInInputs> = async (values) => {
  const errors: Record<string, any> = {};

  if (!values.email) {
    errors.email = { type: "required", message: "Email required" };
  } else if (!EMAIL_REGEX.test(values.email)) {
    errors.email = { type: "pattern", message: "Invalid email format" };
  }

  if (!values.password) {
    errors.password = { type: "required", message: "Password required" };
  } else if (values.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = {
      type: "minLength",
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
    };
  }

  return {
    values: values,
    errors: errors,
    // TODO: type
  } as any;
};

export function useSignInForm() {
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<SignInInputs>({
    resolver: signInResolver, // resolver로 validateInputs 함수를 사용합니다.
    mode: "onTouched",
  });

  const router = useRouter();
  const setUser = useAppState((state) => state.setUser);
  const setToken = useAppState((state) => state.setToken);

  const [isLoading, setIsLoading] = useState(false);
  const [saveEmail, setSaveEmail] = useState(true);

  const emailValue = watch("email");

  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (savedEmail) {
      setValue("email", savedEmail);
      setSaveEmail(true);
    }
  }, [setValue]);

  const handleSaveEmailChange = (checked: boolean) => {
    setSaveEmail(checked);

    if (checked && emailValue) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, emailValue);
    } else {
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }
  };

  const onSubmit: SubmitHandler<SignInInputs> = async (data) => {
    setIsLoading(true);

    if (saveEmail) {
      localStorage.setItem(REMEMBER_EMAIL_KEY, data.email);
    } else {
      localStorage.removeItem(REMEMBER_EMAIL_KEY);
    }

    try {
      const verificationResult = await requestSignIn(data.email, data.password);

      if (!verificationResult.success) {
        if (verificationResult.code === "EMAIL_NOT_VERIFIED") {
          setUser({ email: data.email, is_email_verified: false });
          router.push(paths.sign_up_digits);
          return;
        }
        setError("root", {
          message: verificationResult.msg || "Failed to sign in",
        });
        return;
      }

      const { token, customer } = verificationResult.data ?? {};

      if (!customer.is_email_verified) {
        setUser(customer);
        router.push(paths.sign_up_digits);
        return;
      }

      setToken(token);
      setUser(customer);
      router.replace(paths.home);
    } catch (error: any) {
      console.log("error", error);
      setError("root", { message: error.msg || "Failed to sign in" });
    } finally {
      setIsLoading(false);
    }
  };

  const resetErrors = (field: keyof SignInInputs) => {
    clearErrors("root");
    clearErrors(field);
  };

  return {
    onSubmit: handleSubmit(onSubmit),
    register,
    errors,
    isLoading,
    isValid,
    saveEmail,
    handleSaveEmailChange,
    resetErrors,
  };
}
