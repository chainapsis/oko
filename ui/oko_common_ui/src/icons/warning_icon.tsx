import type { BasicIconProps } from "./types";

export const WarningIcon: React.FC<BasicIconProps> = ({
  className,
  size = 42,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 42 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g opacity="0.3">
        <rect
          x="6"
          y="6"
          width="30"
          height="30"
          rx="15"
          stroke="#DC6803"
          strokeWidth="2"
        />
      </g>
      <g opacity="0.1">
        <rect
          x="1"
          y="1"
          width="40"
          height="40"
          rx="20"
          stroke="#DC6803"
          strokeWidth="2"
        />
      </g>
      <g>
        <path
          d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
          stroke="#DC6803"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(9, 9)"
        />
      </g>
    </svg>
  );
};
