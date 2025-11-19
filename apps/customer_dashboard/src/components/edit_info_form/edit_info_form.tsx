"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@oko-wallet/oko-common-ui/input";
import { Button } from "@oko-wallet/oko-common-ui/button";
import { PlusIcon } from "@oko-wallet/oko-common-ui/icons/plus";
import { XCloseIcon } from "@oko-wallet/oko-common-ui/icons/x_close";

import { useCustomerInfo } from "@oko-wallet-ct-dashboard/hooks/use_customer_info";
import { useAppState } from "@oko-wallet-ct-dashboard/state";
import { requestUpdateCustomerInfo } from "@oko-wallet-ct-dashboard/fetch/customers";
import styles from "./edit_info_form.module.scss";

export const EditInfoForm = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const customer = useCustomerInfo();
  const token = useAppState((state) => state.token);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [label, setLabel] = useState(customer.data?.label ?? "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    customer.data?.logo_url ?? null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // File upload handler (following admin web pattern)
  const handleLogoUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Only image files can be uploaded.");
      return;
    }

    // File size validation (5MB limit for customer dashboard)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB.");
      return;
    }

    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setLogoFile(file);
  };

  // File remove handler (following admin web pattern)
  const handleLogoRemove = () => {
    setPreviewUrl(customer.data?.logo_url ?? null); // Restore original logo
    setLogoFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Please log in to continue.");
      return;
    }

    // Check for changes
    const hasLabelChange = label !== customer.data?.label;
    const hasLogoChange = logoFile !== null;

    if (!hasLabelChange && !hasLogoChange) {
      setError("No changes to save.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await requestUpdateCustomerInfo({
        token,
        label: hasLabelChange ? label : undefined,
        logoFile: logoFile,
      });

      if (result.success) {
        // Invalidate query to refetch customer info
        await queryClient.invalidateQueries({ queryKey: ["customer"] });

        // Reset state
        setLogoFile(null);

        // Navigate back or show success message
        alert("Information updated successfully!");
        router.back();
      } else {
        setError(result.msg ?? "Failed to update information.");
      }
    } catch (err) {
      setError("An error occurred while updating.");
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges =
    label !== customer.data?.label || logoFile !== null;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Team Name Input */}
      <Input
        label="Team Name"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        disabled={isLoading}
        placeholder="Team Name"
        className={styles.input}
      />

      {/* Logo Upload (following admin web pattern) */}
      <div className={styles.appLogoUploadWrapper}>
        <label className={styles.appLogoUploadLabel}>
          <span className={styles.appLogoUploadLabelText}>App Logo</span>
        </label>
        <p className={styles.appLogoUploadDescription}>
          Image with a 2:1 aspect ratio and with a size of 180px x 90px. SVGs
          are not allowed.
        </p>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          style={{ display: "none" }}
          disabled={isLoading}
        />

        {/* Clickable upload area */}
        <div
          className={styles.appLogoUploadInput}
          onClick={handleUploadClick}
        >
          {previewUrl ? (
            <div className={styles.logoPreview}>
              <img
                src={previewUrl}
                alt="Logo preview"
                className={styles.logoPreviewImage}
              />
              <button
                type="button"
                className={styles.removeButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogoRemove();
                }}
                disabled={isLoading}
              >
                <XCloseIcon
                  className={styles.xCloseIcon}
                  color="var(--text-white)"
                />
              </button>
            </div>
          ) : (
            <div className={styles.appLogoUploadIcon}>
              <PlusIcon
                className={styles.plusIcon}
                color="var(--text-primary)"
              />
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Submit button */}
      <Button
        type="submit"
        disabled={isLoading || !hasChanges}
        className={styles.submitButton}
      >
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
};
