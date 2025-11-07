"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@oko-wallet/oko-common-ui/button";

import { paths } from "@oko-wallet-admin/paths";
import { useGetCustomerListWithAPIKeys } from "./use_get_customer";
import { TitleHeader } from "@oko-wallet-admin/components/title_header/title_header";

export const AppsViewHeader: React.FC = () => {
  const router = useRouter();

  const { data } = useGetCustomerListWithAPIKeys();

  const hasApps = data && data.pagination && data.pagination.total > 0;

  return (
    <TitleHeader
      title="Manage Apps"
      totalCount={hasApps ? data?.pagination.total : undefined}
      renderRightContent={() => (
        <Button
          onClick={() => {
            router.push(paths.apps_create);
          }}
          size="md"
        >
          Add New App
        </Button>
      )}
    />
  );
};
