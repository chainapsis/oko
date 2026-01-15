"use client";

import { type FC, useState } from "react";
import { Badge } from "@oko-wallet/oko-common-ui/badge";
import { CopyOutlinedIcon } from "@oko-wallet/oko-common-ui/icons/copy_outlined";
import { EyeIcon } from "@oko-wallet/oko-common-ui/icons/eye";
import { EyeOffIcon } from "@oko-wallet/oko-common-ui/icons/eye_off";
import { TableCell, TableRow } from "@oko-wallet/oko-common-ui/table";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import { Spacing } from "@oko-wallet/oko-common-ui/spacing";

import styles from "./api_key_list.module.scss";

export type APIKeyItemRowProps = {
  apiKey: string;
  status: "active" | "inactive";
  createdDate: string;
};

export const APIKeyItemRow: FC<APIKeyItemRowProps> = ({
  apiKey,
  status,
  createdDate,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const apiKeyHalfLength = Math.floor(apiKey.length / 2);

  return (
    <TableRow key={apiKey}>
      <TableCell className={styles.apiKeyCell}>
        <Badge
          label={status.charAt(0).toUpperCase() + status.slice(1)}
          color={status === "active" ? "success" : "error"}
          size="sm"
          type="pill"
        />
        <Spacing width={8} />

        <Typography
          tagType="span"
          size="md"
          weight="medium"
          color="secondary"
          className={styles.apiKey}
        >
          {isVisible
            ? apiKey
            : apiKey.slice(0, apiKeyHalfLength) + "*".repeat(apiKeyHalfLength)}
        </Typography>

        <Spacing width={8} />

        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          className={styles.buttonIcon}
        >
          {isVisible ? (
            <EyeOffIcon color="var(--fg-tertiary)" size={16} />
          ) : (
            <EyeIcon color="var(--fg-tertiary)" size={16} />
          )}
        </button>

        <Spacing width={4} />

        {isCopied ? (
          <Typography
            tagType="span"
            size="xs"
            color="success-primary"
            className={styles.copiedText}
          >
            Copied ✓
          </Typography>
        ) : (
          <button type="button" onClick={handleCopy} className={styles.buttonIcon}>
            <CopyOutlinedIcon color="var(--fg-tertiary)" />
          </button>
        )}
      </TableCell>

      <TableCell className={styles.dateCell}>
        {formatDate(createdDate)}
      </TableCell>
    </TableRow>
  );
};

function formatDate(dateString: string): string {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString);
  // This ensures consistent date formatting between server and client
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
