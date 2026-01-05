import type { FC } from "react";

import type { BasicIconProps } from "./types";

export const ChevronUpIcon: FC<BasicIconProps> = ({
  className,
  color = "currentColor",
  size = 16,
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
        d="M12 10L8 6L4 10"
        stroke={color}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
