import { requestGetCustomerAPIKeys } from "@oko-wallet-ct-dashboard/fetch/customers";
import { useQuery } from "@tanstack/react-query";

import { useCustomerInfo } from "./use_customer_info";
import { useAppState } from "@oko-wallet-ct-dashboard/state";

export const useAPIKeys = () => {
  const user = useAppState((state) => state.user);
  const token = useAppState((state) => state.token);

  const { data: customer } = useCustomerInfo();

  return useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const res = await requestGetCustomerAPIKeys({
        token: token ?? "",
        email: user?.email ?? "",
        customer_id: customer?.customer_id ?? "",
      });

      if (!res.success) {
        return [];
      }

      return res.data;
    },
    enabled: !!token && !!user?.email && !!customer,
  });
};
