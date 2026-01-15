"use client";

import {
  autoUpdate,
  FloatingPortal,
  offset,
  type Placement,
  useClick,
  useDismiss,
  useFloating,
  useId,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import cn from "classnames";
import { type FC, type ReactNode, useCallback, useState } from "react";

import { Typography } from "@oko-wallet/oko-common-ui/typography";

import styles from "./anchored_menu.module.scss";

export const AnchoredMenu: FC<AnchoredMenuProps> = ({
  TriggerComponent,
  HeaderComponent = null,
  menuItems,
  placement = "right-start",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    middleware: [offset(8)],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "menu" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const headingId = useId();

  const handleMenuItemClick = useCallback((item: AnchoredMenuItem) => {
    item.onClick();
    setIsOpen(false);
  }, []);

  return (
    <>
      <div
        ref={refs.setReference}
        className={styles.wrapper}
        {...getReferenceProps()}
      >
        {TriggerComponent}
      </div>

      <FloatingPortal>
        {isOpen && (
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            aria-labelledby={headingId}
            className={cn(styles.menu, className)}
            {...getFloatingProps()}
          >
            {HeaderComponent}
            <ul className={styles.menuList}>
              {menuItems.map((item) => (
                <li
                  key={item.id}
                  className={styles.menuItem}
                  onClick={() => handleMenuItemClick(item)}
                >
                  {item.icon && (
                    <span className={styles.menuItemIcon}>{item.icon}</span>
                  )}
                  <Typography
                    size="sm"
                    weight="semibold"
                    color="secondary"
                    className={styles.menuItemLabel}
                  >
                    {item.label}
                  </Typography>
                </li>
              ))}
            </ul>
          </div>
        )}
      </FloatingPortal>
    </>
  );
};

export type AnchoredMenuItem = {
  id: string;
  label: string;
  onClick: () => void;
  icon?: ReactNode;
};

export type AnchoredMenuProps = {
  TriggerComponent: ReactNode;
  menuItems: AnchoredMenuItem[];
  placement?: Placement;
  disabled?: boolean;
  HeaderComponent?: ReactNode;
  className?: string;
};
