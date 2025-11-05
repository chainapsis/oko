"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import styles from "./navigation.module.scss";
import { NavItem } from "./nav_item";
import { NavMenu } from "./nav_menu";
import { navigationItems } from "./nav_items";

export interface NavigationItem {
  label: string;
  route: string;
  icon?: React.ReactNode;
  subItems?: Array<{ label: string; route: string }>;
}

export interface NavigationProps {
  // items: NavigationItem[];
}

export const Navigation: React.FC<NavigationProps> = () => {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const newOpenMenus: Record<string, boolean> = {};
    navigationItems.forEach((item) => {
      if (item.subItems) {
        const isCurrentPath = item.subItems.some(
          (subItem) => pathname === subItem.route,
        );
        if (isCurrentPath) {
          newOpenMenus[item.route] = true;
        }
      }
    });
    setOpenMenus(newOpenMenus);
  }, [pathname]);

  const toggleMenu = (route: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [route]: !prev[route],
    }));
  };

  return (
    <div className={styles.wrapper}>
      {navigationItems.map((item) => {
        if (item.subItems && item.subItems.length > 0) {
          return (
            // has sub items
            <div key={item.route}>
              <NavItem
                kind="trigger"
                // TODO: @elden
                onClick={() => toggleMenu(item.route)}
                icon={item.icon}
              >
                {item.label}
              </NavItem>
              {openMenus[item.route] && (
                <NavMenu>
                  {item.subItems.map((subItem) => (
                    <NavItem
                      key={subItem.route}
                      onClick={() => router.push(subItem.route)}
                      active={pathname === subItem.route}
                    >
                      {subItem.label}
                    </NavItem>
                  ))}
                </NavMenu>
              )}
            </div>
          );
        } else {
          // no sub items
          return (
            <NavItem
              key={item.route}
              kind="trigger"
              onClick={() => router.push(item.route)}
              icon={item.icon}
              active={pathname === item.route}
            >
              {item.label}
            </NavItem>
          );
        }
      })}
    </div>
  );
};
