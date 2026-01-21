import type { FC } from "react";

export const CheckIcon: FC<CheckIconProps> = ({ size = 14, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
    >
      <path
        d="M12.1666 3.5L5.74998 9.91667L2.83331 7"
        stroke={color || "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

interface CheckIconProps {
  size?: number;
  color?: string;
}
