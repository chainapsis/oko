import { useQuery } from "@tanstack/react-query";

import { getAllKeyShareNodes } from "@oko-wallet-admin/fetch/ks_node";
import { useAppState } from "@oko-wallet-admin/state";

export const useAllKeyShareNodes = () => {
  const { token } = useAppState();

  return useQuery({
    queryKey: ["all-ks-nodes"],
    queryFn: async () => {
      if (!token) {
        throw new Error("Token is not found");
      }

      const response = await getAllKeyShareNodes({ token });

      if (!response.success) {
        throw new Error(response.msg);
      }

      return response.data;
    },
  });
};
