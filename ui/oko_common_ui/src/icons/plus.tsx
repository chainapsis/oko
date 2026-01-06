import type { FC } from "react";

import type { BasicIconProps } from "./types";

export const PlusIcon: FC<BasicIconProps> = ({
  className,
  color = "currentColor",
  size = 20,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <path
        d="M10.0001 4.16669V15.8334M4.16675 10H15.8334"
        stroke={color}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
