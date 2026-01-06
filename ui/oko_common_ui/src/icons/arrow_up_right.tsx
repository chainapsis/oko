import type { FC } from "react";

import type { BasicIconProps } from "./types";

export const ArrowUpRightIcon: FC<BasicIconProps> = ({
  className,
  size = 16,
  color = "currentColor",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path
        d="M4.66699 11.3332L11.3337 4.6665M11.3337 4.6665H4.66699M11.3337 4.6665V11.3332"
        stroke={color}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
