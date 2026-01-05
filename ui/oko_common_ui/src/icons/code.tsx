import type { FC } from "react";

import type { BasicIconProps } from "./types";

export const CodeIcon: FC<BasicIconProps> = ({
  className,
  color = "currentColor",
  size = 20,
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
        d="M10.6666 12L14.6666 8L10.6666 4M5.33325 4L1.33325 8L5.33325 12"
        stroke={color}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
