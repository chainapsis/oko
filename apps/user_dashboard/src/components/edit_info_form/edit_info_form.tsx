"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@oko-wallet/oko-common-ui/input";
import { Button } from "@oko-wallet/oko-common-ui/button";
import { PlusIcon } from "@oko-wallet/oko-common-ui/icons/plus";
import { XCloseIcon } from "@oko-wallet/oko-common-ui/icons/x_close";

import { useCustomerInfo } from "@oko-wallet-user-dashboard/hooks/use_customer_info";
import { useAppState } from "@oko-wallet-user-dashboard/state";
import { requestUpdateCustomerInfo } from "@oko-wallet-user-dashboard/fetch/customers";
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
  const [isDragging, setIsDragging] = useState(false);
  const [shouldDeleteLogo, setShouldDeleteLogo] = useState(false);

  // Validate image dimensions (128x128)
  const validateImageDimensions = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve(img.width === 128 && img.height === 128);
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        resolve(false);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // File upload handler with proper validation
  const handleLogoUpload = async (file: File) => {
    // Check file type (no SVG, no GIF)
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only PNG, JPG, and WebP image files are allowed. SVG and GIF are not supported.",
      );
      return;
    }

    // File size validation (1MB limit)
    if (file.size > 1 * 1024 * 1024) {
      setError("File size must be under 1 MB.");
      return;
    }

    // Validate dimensions (128x128)
    const isValidDimensions = await validateImageDimensions(file);
    if (!isValidDimensions) {
      setError("Image must be exactly 128×128 pixels.");
      return;
    }

    setError(null);
    setShouldDeleteLogo(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setLogoFile(file);
  };

  // File remove handler - completely remove logo
  const handleLogoRemove = () => {
    setPreviewUrl(null);
    setLogoFile(null);
    setShouldDeleteLogo(true); // Mark for deletion
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

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Please log in to continue.");
      return;
    }

    // Check for changes
    const hasLabelChange = label !== customer.data?.label;
    const hasLogoChange = logoFile !== null || shouldDeleteLogo;

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
        deleteLogo: shouldDeleteLogo,
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
    label !== customer.data?.label || logoFile !== null || shouldDeleteLogo;

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

      {/* Logo Upload with drag & drop */}
      <div className={styles.appLogoUploadWrapper}>
        <label className={styles.appLogoUploadLabel}>
          <span className={styles.appLogoUploadLabelText}>App Logo</span>
        </label>
        <p className={styles.appLogoUploadDescription}>
          App logo file in 128×128 px size, under 1 MB, and not in SVG format.
          Drag and drop or click to upload.
        </p>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileSelect}
          style={{ display: "none" }}
          disabled={isLoading}
        />

        {/* Clickable upload area with drag & drop */}
        <div
          className={`${styles.appLogoUploadInput} ${isDragging ? styles.dragging : ""}`}
          onClick={handleUploadClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
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
