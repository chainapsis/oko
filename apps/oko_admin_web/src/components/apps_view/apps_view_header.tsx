"use client";

import type { FC } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@oko-wallet/oko-common-ui/button";

import { paths } from "@oko-wallet-admin/paths";
import { useGetCustomerListWithAPIKeys } from "./use_get_customer";
import { TitleHeader } from "@oko-wallet-admin/components/title_header/title_header";

export const AppsViewHeader: FC = () => {
  const router = useRouter();

  const { data } = useGetCustomerListWithAPIKeys();

  const hasApps = data?.pagination && data.pagination.total > 0;

  const verifiedCount = data?.pagination?.verified_count;
  const txGenCount = data?.pagination?.tx_active_count;

  return (
    <TitleHeader
      title="Manage Apps"
      totalCount={hasApps ? data?.pagination.total : undefined}
      verifiedCount={verifiedCount}
      txGenCount={txGenCount}
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
