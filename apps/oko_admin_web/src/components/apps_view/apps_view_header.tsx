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

  const verifiedCount = React.useMemo(() => {
    if (!data?.customerWithAPIKeysList) return undefined;

    return data.customerWithAPIKeysList.filter((customer) => {
      return customer.customer_dashboard_users?.some(
        (user) => user.is_email_verified === true,
      );
    }).length;
  }, [data]);

  const txGenCount = React.useMemo(() => {
    if (!data?.customerWithAPIKeysList) return undefined;

    return data.customerWithAPIKeysList.filter(
      (customer) => customer.has_tss_sessions === true,
    ).length;
  }, [data]);

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
