"use client";

import { useState, type FC } from "react";
import type { AuditEventFilter } from "@oko-wallet/oko-types/admin";
import { Input } from "@oko-wallet/oko-common-ui/input";
import { Button } from "@oko-wallet/oko-common-ui/button";
import { Typography } from "@oko-wallet/oko-common-ui/typography";

import styles from "./audit_logs_filter.module.scss";

const TARGET_TYPES = [
  { value: "", label: "All Target Types" },
  { value: "customer", label: "Customer" },
  { value: "node", label: "Node" },
  { value: "user", label: "User" },
  { value: "policy", label: "Policy" },
];

const ACTIONS = [
  { value: "", label: "All Actions" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "enable", label: "Enable" },
  { value: "disable", label: "Disable" },
  { value: "login", label: "Login" },
  { value: "logout", label: "Logout" },
  { value: "policy_update", label: "Policy Update" },
];

const OUTCOMES = [
  { value: "", label: "All Outcomes" },
  { value: "success", label: "Success" },
  { value: "failure", label: "Failure" },
  { value: "denied", label: "Denied" },
];

interface AuditLogsFilterProps {
  filter: AuditEventFilter;
  onFilterChange: (filter: AuditEventFilter) => void;
}

export const AuditLogsFilter: FC<AuditLogsFilterProps> = ({
  filter,
  onFilterChange,
}) => {
  const [localFilter, setLocalFilter] = useState<AuditEventFilter>(filter);

  const handleFilterChange = (key: keyof AuditEventFilter, value: any) => {
    const newFilter = { ...localFilter, [key]: value };
    setLocalFilter(newFilter);
  };

  const applyFilter = () => {
    onFilterChange(localFilter);
  };

  const resetFilter = () => {
    const emptyFilter: AuditEventFilter = {};
    setLocalFilter(emptyFilter);
    onFilterChange(emptyFilter);
  };

  return (
    <div className={styles.container}>
      <Typography size="lg" weight="semibold" className={styles.title}>
        Filter Audit Logs
      </Typography>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Target Type</label>
          <select
            value={localFilter.target_type || ""}
            onChange={(e) =>
              handleFilterChange("target_type", e.target.value || undefined)
            }
            className={styles.select}
          >
            {TARGET_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Action</label>
          <select
            value={localFilter.action || ""}
            onChange={(e) =>
              handleFilterChange("action", e.target.value || undefined)
            }
            className={styles.select}
          >
            {ACTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Outcome</label>
          <select
            value={localFilter.outcome || ""}
            onChange={(e) =>
              handleFilterChange("outcome", e.target.value || undefined)
            }
            className={styles.select}
          >
            {OUTCOMES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Target ID</label>
          <Input
            value={localFilter.target_id || ""}
            onChange={(e) =>
              handleFilterChange("target_id", e.target.value || undefined)
            }
            placeholder="Enter target ID"
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Actor</label>
          <Input
            value={localFilter.actor || ""}
            onChange={(e) =>
              handleFilterChange("actor", e.target.value || undefined)
            }
            placeholder="Enter actor"
          />
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={resetFilter}>
          Reset
        </Button>
        <Button onClick={applyFilter}>Apply Filter</Button>
      </div>
    </div>
  );
};
