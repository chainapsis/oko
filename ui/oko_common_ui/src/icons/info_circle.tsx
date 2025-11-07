import type { BasicIconProps } from "./types";

export const InfoCircleIcon: React.FC<BasicIconProps> = ({
  className,
  color = "#535862",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path
        d="M7.99992 10.6667V8M7.99992 5.33333H8.00659M14.6666 8C14.6666 11.6819 11.6818 14.6667 7.99992 14.6667C4.31802 14.6667 1.33325 11.6819 1.33325 8C1.33325 4.3181 4.31802 1.33333 7.99992 1.33333C11.6818 1.33333 14.6666 4.3181 14.6666 8Z"
        stroke={color}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
