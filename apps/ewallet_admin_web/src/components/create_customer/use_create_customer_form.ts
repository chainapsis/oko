import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import type {
  CreateCustomerResponse,
  CreateCustomerWithDashboardUserRequest,
} from "@oko-wallet/ewallet-types/admin";
import { type OkoApiSuccessResponse } from "@oko-wallet/ewallet-types/api_response";

import {
  isValidEmail,
  isValidPassword,
  isValidUrl,
  PASSWORD_MIN_LEN,
} from "@oko-wallet-admin/utils/";
import { addCustomer } from "@oko-wallet-admin/fetch/customer";
import { useAppState } from "@oko-wallet-admin/state";

export function useCreateCustomerForm() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CreateCustomerWithDashboardUserRequest>();
  const { token } = useAppState();

  const handleLogoUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Only image files can be uploaded.");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      alert("File size must be less than 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setLogoFile(file);
  };

  const handleLogoRemove = (
    fileInputRef?: React.RefObject<HTMLInputElement | null>,
  ) => {
    setLogoPreview(null);
    setLogoFile(null);
    if (fileInputRef?.current) {
      fileInputRef.current.value = "";
    }
  };

  const mutation = useMutation<
    OkoApiSuccessResponse<CreateCustomerResponse> | undefined,
    any,
    CreateCustomerWithDashboardUserRequest
  >({
    mutationFn: async (data) => {
      if (!token) {
        throw new Error("Please log in to continue.");
      }

      if (!data.label) {
        setError("label", {
          message: "Team Name is required.",
        });
        return;
      }

      if (data.url && !/^(https?:\/\/)/i.test(data.url)) {
        data.url = `https://${data.url}`;
      }

      if (!data.url) {
        setError("url", {
          message: "App URL must exist.",
        });
        return;
      }

      if (!isValidUrl(data.url)) {
        setError("url", {
          message: "App URL format is invalid.",
        });
        return;
      }

      if (!isValidEmail(data.email)) {
        setError("email", {
          message: "Email format is invalid.",
        });
      }

      if (!isValidPassword(data.password)) {
        setError("password", {
          message: `Password must be at least ${PASSWORD_MIN_LEN} characters long.`,
        });
      }

      if (Object.keys(errors).length > 0) {
        return;
      }

      const body = {
        label: data.label,
        url: data.url,
        logo: logoFile || undefined,
        email: data.email,
        password: data.password,
      };

      const response = await addCustomer({ token, data: body });

      if (!response.success) {
        throw new Error(response.msg ?? "Failed to create customer.");
      }

      return {
        success: true,
        data: response.data,
      };
    },
  });

  return {
    mutation,
    errors,
    logoPreview,
    handleSubmit,
    register,
    handleLogoUpload,
    handleLogoRemove,
  };
}
