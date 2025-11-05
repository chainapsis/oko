import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteCustomerAndCTDUsers } from "@oko-wallet-admin/fetch/customer";
import { useAppState } from "@oko-wallet-admin/state";

export function useDeleteCustomerAndCTDUsers() {
  const { token } = useAppState();
  const queryClient = useQueryClient();

  const mutation = useMutation<any, any, { customer_id: string }>({
    mutationFn: async ({ customer_id }) => {
      if (!token) {
        throw new Error("Login required");
      }

      const response = await deleteCustomerAndCTDUsers({ token, customer_id });

      if (!response.success) {
        throw new Error(
          response.msg ?? "Failed to delete customer and related CTD users",
        );
      }

      return {
        success: true,
        data: response.data,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer_list"] });
    },
  });

  return mutation;
}
