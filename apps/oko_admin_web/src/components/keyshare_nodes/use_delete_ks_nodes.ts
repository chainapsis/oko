import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteKeyShareNode } from "@oko-wallet-admin/fetch/ks_node";
import { useAppState } from "@oko-wallet-admin/state";

export function useDeleteKSNodes() {
  const { token } = useAppState();
  const queryClient = useQueryClient();

  const mutation = useMutation<any, any, { node_id: string }>({
    mutationFn: async ({ node_id }) => {
      if (!token) {
        throw new Error("Login required");
      }

      const response = await deleteKeyShareNode({ token, node_id });

      if (!response.success) {
        throw new Error(response.msg ?? "Failed to delete key share node");
      }

      return {
        success: true,
        data: response.data,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-ks-nodes"] });
    },
  });

  return mutation;
}
