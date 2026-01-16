"use client";

import type { FC } from "react";
import { Input } from "@oko-wallet/oko-common-ui/input";
import { Button } from "@oko-wallet/oko-common-ui/button";
import { PlusIcon } from "@oko-wallet/oko-common-ui/icons/plus";
import { XCloseIcon } from "@oko-wallet/oko-common-ui/icons/x_close";
import type { CustomerTheme } from "@oko-wallet/oko-types/customers";
import { Typography } from "@oko-wallet/oko-common-ui/typography";

import { useEditInfoForm } from "./use_edit_info_form";
import styles from "./edit_info_form.module.scss";

const THEME_OPTIONS: CustomerTheme[] = ["light", "dark", "system"];

export const EditInfoForm: FC = () => {
  const {
    onSubmit,
    register,
    errors,
    isLoading,
    hasChanges,
    theme,
    setTheme,
    fileInputRef,
    previewUrl,
    isDragging,
    handleFileSelect,
    handleUploadClick,
    handleLogoRemove,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    resetErrors,
  } = useEditInfoForm();

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      {/* Team Name Input */}
      <Input
        label="Team Name"
        {...register("label")}
        disabled={isLoading}
        placeholder="Team Name"
        className={styles.input}
        error={errors.label?.message}
        onFocus={() => resetErrors("label")}
      />

      {/* App URL Input */}
      <Input
        label="App URL"
        {...register("url")}
        disabled={isLoading}
        placeholder="https://example.com"
        className={styles.input}
        error={errors.url?.message}
        onFocus={() => resetErrors("url")}
      />

      <div className={styles.themeSection}>
        <div className={styles.themeHeader}>
          <span className={styles.themeLabel}>Oko Wallet Theme</span>
          <span className={styles.themeDescription}>
            Choose the default theme for the Oko wallet.
          </span>
        </div>

        <div className={styles.themeOptions}>
          {THEME_OPTIONS.map((option) => {
            const label =
              option === "system"
                ? "System"
                : option === "light"
                  ? "Light"
                  : "Dark";

            return (
              <button
                key={option}
                type="button"
                className={`${styles.themeOptionButton} ${
                  theme === option ? styles.themeOptionButtonActive : ""
                }`}
                onClick={() => setTheme(option)}
                disabled={isLoading}
              >
                <Typography
                  size="sm"
                  weight="medium"
                  color={theme === option ? "primary-on-brand" : "primary"}
                >
                  {label}
                </Typography>
              </button>
            );
          })}
        </div>
      </div>

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
      {errors.root && <div className={styles.error}>{errors.root.message}</div>}

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
