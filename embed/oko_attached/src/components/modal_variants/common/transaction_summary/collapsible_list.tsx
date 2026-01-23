import { Skeleton } from "@oko-wallet/oko-common-ui/skeleton";
import { Spacing } from "@oko-wallet/oko-common-ui/spacing";
import type { ReactNode } from "react";

import styles from "./transaction_summary.module.scss";
import { Collapsible } from "@oko-wallet-attached/components/collapsible/collapsible";

export interface CollapsibleListProps<T> {
  items: T[];
  getKey: (item: T, index: number) => string;
  getTitle: (item: T) => string;
  renderContent: (item: T) => ReactNode;
  isLoading?: boolean;
}

export function CollapsibleList<T>({
  items,
  getKey,
  getTitle,
  renderContent,
  isLoading,
}: CollapsibleListProps<T>): ReactNode {
  if (isLoading) {
    return <Skeleton width="100%" height="48px" />;
  }

  return (
    <div className={styles.list}>
      {items.map((item, index) => (
        <div key={getKey(item, index)}>
          {index > 0 && <Spacing height={12} />}
          <Collapsible title={getTitle(item)} size="xs">
            {renderContent(item)}
          </Collapsible>
        </div>
      ))}
    </div>
  );
}
