import { useQuery } from "@tanstack/react-query";

import { useAppState } from "@oko-wallet-admin/state";
import { doFetch } from "../fetcher";
import { OKO_ADMIN_API_ENDPOINT_V1 } from "..";

export function useKSNHealthChecks() {
  const { token } = useAppState();

  return useQuery({
    queryKey: ["ksn-health-checks"],
    queryFn: async () => {
      if (!token) {
        throw new Error("Token is not found");
      }

      const response = await doFetch<any>(
        `${OKO_ADMIN_API_ENDPOINT_V1}/ks_node/get_ksn_health_checks`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        },
      );

      if (!response.success) {
        throw new Error(response.msg);
      }

      return response.data;
    },
  });
}
