"use client";

import { FC, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { PricePretty } from "@keplr-wallet/unit";
import { Typography } from "@oko-wallet-common-ui/typography/typography";
import { Button } from "@oko-wallet-common-ui/button/button";

import styles from "./total_balance.module.scss";
import { useRootStore } from "@oko-wallet-user-dashboard/state/store";
import { DepositModal } from "@oko-wallet-user-dashboard/components/deposit_modal/deposit_modal";

export const TotalBalance: FC = observer(() => {
  const { hugeQueriesStore } = useRootStore();
  const spendableTotalPrice = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of hugeQueriesStore.allKnownBalances) {
      if (bal.price) {
        if (!result) {
          result = bal.price;
        } else {
          result = result.add(bal.price);
        }
      }
    }
    return result;
  }, [hugeQueriesStore.allKnownBalances]);

  return (
    <div className={styles.container}>
      <Typography tagType="h1" size="xl" weight="semibold" color="primary">
        Total Balance
      </Typography>

      <Typography size="display-xs" weight="semibold" color="primary">
        {spendableTotalPrice?.toString()}
      </Typography>

      <DepositModal
        renderTrigger={({ onOpen }) => (
          <Button
            variant="primary"
            size="md"
            fullWidth={false}
            onClick={onOpen}
          >
            Deposit
          </Button>
        )}
      />
    </div>
  );
});
