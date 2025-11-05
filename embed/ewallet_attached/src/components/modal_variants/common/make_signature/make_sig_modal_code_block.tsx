import { CodeBlock } from "@oko-wallet-attached/components/code_block/code_block";

import cn from "classnames";

import styles from "./make_sig_modal_code_block.module.scss";

interface MakeSignatureRawCodeBlockProps {
  code: string;
  className?: string;
}

export const MakeSignatureRawCodeBlock: React.FC<
  MakeSignatureRawCodeBlockProps
> = ({ code, className }) => {
  return <CodeBlock className={cn(styles.codeBlock, className)} code={code} />;
};
