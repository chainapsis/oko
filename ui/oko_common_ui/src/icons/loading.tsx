import type { FC } from "react";

import type { BasicIconProps } from "./types";

export const LoadingIcon: FC<BasicIconProps & { backgroundColor?: string }> = ({
  className,
  color = "currentColor",
  backgroundColor = "transparent",
  size = 32,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
    >
      <path
        d="M30 16C30 17.8385 29.6379 19.659 28.9343 21.3576C28.2308 23.0561 27.1995 24.5995 25.8995 25.8995C24.5995 27.1995 23.0561 28.2307 21.3576 28.9343C19.659 29.6379 17.8385 30 16 30C14.1615 30 12.341 29.6379 10.6424 28.9343C8.94387 28.2307 7.40052 27.1995 6.1005 25.8995C4.80048 24.5995 3.76925 23.0561 3.06569 21.3576C2.36212 19.659 2 17.8385 2 16C2 14.1615 2.36212 12.341 3.06569 10.6424C3.76926 8.94387 4.80049 7.40052 6.10051 6.1005C7.40053 4.80048 8.94388 3.76925 10.6424 3.06568C12.341 2.36212 14.1615 2 16 2C17.8385 2 19.659 2.36212 21.3576 3.06569C23.0561 3.76926 24.5995 4.80049 25.8995 6.10051C27.1995 7.40053 28.2308 8.94388 28.9343 10.6424C29.6379 12.341 30 14.1615 30 16L30 16Z"
        stroke={backgroundColor}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 2C17.8385 2 19.659 2.36212 21.3576 3.06569C23.0561 3.76925 24.5995 4.80049 25.8995 6.10051C27.1995 7.40053 28.2308 8.94388 28.9343 10.6424C29.6379 12.341 30 14.1615 30 16"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
