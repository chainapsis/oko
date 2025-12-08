import type { InputHTMLAttributes } from "react";

import Button from "./Button";

interface TxFormProps {
  title: string;
  recipientLabel?: string;
  recipientPlaceholder: string;
  amountLabel?: string;
  amountPlaceholder: string;
  // keep types flexible to work with react-hook-form from parent
  register: (name: "recipientAddress" | "amount") => unknown;
  errors: Record<string, { message?: string }>;
  onSubmit: () => void | Promise<void>;
  canSend: boolean;
  loading: boolean;
}

export default function TxForm(props: TxFormProps) {
  const {
    title,
    recipientLabel = "Recipient Address",
    recipientPlaceholder,
    amountLabel = "Amount",
    amountPlaceholder,
    register,
    errors,
    onSubmit,
    canSend,
    loading,
  } = props;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit();
      }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="flex flex-col gap-1">
        <label>{recipientLabel}</label>
        <input
          type="text"
          placeholder={recipientPlaceholder}
          {...(register(
            "recipientAddress",
          ) as unknown as InputHTMLAttributes<HTMLInputElement>)}
        />
        {errors.recipientAddress?.message && (
          <p className="text-red-400 text-sm mt-1">
            {errors.recipientAddress.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label>{amountLabel}</label>
        <input
          type="text"
          placeholder={amountPlaceholder}
          {...(register(
            "amount",
          ) as unknown as InputHTMLAttributes<HTMLInputElement>)}
        />
        {errors.amount?.message && (
          <p className="text-red-400 text-sm mt-1">{errors.amount.message}</p>
        )}
      </div>
      <Button type="submit" fullWidth disabled={!canSend} loading={loading}>
        Send
      </Button>
    </form>
  );
}
