import { FC } from "react";
import { Typography } from "@oko-wallet-common-ui/typography/typography";

export const TotalBalance: FC = () => {
  return (
    <div>
      <Typography tagType="h1" size="xl" weight="semibold" color="primary">
        Total Balance
      </Typography>
    </div>
  );
};
