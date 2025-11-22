import type { BasicIconProps } from "./types";

export const CloseButtonIcon: React.FC<BasicIconProps> = ({
  className,
  color = "#A4A7AE",
  size = 12,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M1 1L11 11M1 11L11 1"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
