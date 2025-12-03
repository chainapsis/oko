import { CodeBlock } from "@oko-wallet-attached/components/code_block/code_block";

import cn from "classnames";

import styles from "./make_sig_modal_code_block.module.scss";
import { useMemo, type FC } from "react";

interface MakeSignatureRawCodeBlockProps {
  code: string;
  className?: string;
}

export const MakeSignatureRawCodeBlock: FC<MakeSignatureRawCodeBlockProps> = ({
  code,
  className,
}) => {
  const formattedCode = useMemo(() => {
    try {
      const parsed = JSON.parse(code);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return code;
    }
  }, [code]);

  return (
    <CodeBlock
      className={cn(styles.codeBlock, className)}
      code={formattedCode}
    />
  );
};
