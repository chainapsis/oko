import { ChevronDownIcon } from "@oko-wallet/oko-common-ui/icons/chevron_down";
import { Typography } from "@oko-wallet/oko-common-ui/typography";
import cn from "classnames";
import { type FC, useCallback, useEffect, useRef, useState } from "react";

import styles from "./collapsible.module.scss";

export interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  size?: "xs" | "sm";
}

export const Collapsible: FC<CollapsibleProps> = ({
  title,
  children,
  defaultExpanded = false,
  className,
  size = "sm",
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const updateFadeVisibility = useCallback(() => {
    const el = contentRef.current;
    if (!el) {
      return;
    }

    const hasOverflow = el.scrollHeight > el.clientHeight;
    const isAtTop = el.scrollTop <= 0;
    const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;

    setShowTopFade(hasOverflow && !isAtTop);
    setShowBottomFade(hasOverflow && !isAtBottom);
  }, []);

  useEffect(() => {
    if (isExpanded) {
      updateFadeVisibility();
    }
  }, [isExpanded, updateFadeVisibility]);

  function toggleExpanded() {
    setIsExpanded((prev) => !prev);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleExpanded();
    }
  }

  return (
    <div className={cn(styles.collapsibleContainer, className)}>
      <div
        className={styles.collapsibleHeader}
        onClick={toggleExpanded}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
      >
        <Typography color="secondary" size={size} weight="semibold">
          {title}
        </Typography>
        <div className={styles.chevronIconWrapper}>
          <ChevronDownIcon
            className={cn(styles.chevronIcon, {
              [styles.expanded]: isExpanded,
            })}
          />
        </div>
      </div>
      {isExpanded && (
        <div
          className={cn(styles.collapsibleContentWrapper, {
            [styles.showTopFade]: showTopFade,
            [styles.showBottomFade]: showBottomFade,
          })}
        >
          <div
            ref={contentRef}
            className={styles.collapsibleContent}
            onScroll={updateFadeVisibility}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
};
