import { useQuery } from "@tanstack/react-query";

import { requestGetCustomerInfo } from "@oko-wallet-ct-dashboard/fetch/customers";
import { useAppState } from "@oko-wallet-ct-dashboard/state";

export const useCustomerInfo = () => {
  const user = useAppState((state) => state.user);
  const token = useAppState((state) => state.token);

  return useQuery({
    queryKey: ["customer"],
    queryFn: async () => {
      const customer = await requestGetCustomerInfo({
        token: token ?? "",
        email: user?.email ?? "",
      });
      return customer.success ? customer.data : null;
    },
    enabled: !!token && !!user?.email,
  });
};
