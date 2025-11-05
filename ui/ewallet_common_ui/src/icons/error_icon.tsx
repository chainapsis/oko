import type { BasicIconProps } from "./types";

export const ErrorIcon: React.FC<BasicIconProps> = ({
  className,
  color = "currentColor",
  size = 20,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 26 26"
      fill="none"
      className={className}
      width={size}
      height={size}
    >
      <path
        d="M13.0007 8.3335V13.0002M13.0007 17.6668H13.0123M24.6673 13.0002C24.6673 19.4435 19.444 24.6668 13.0007 24.6668C6.55733 24.6668 1.33398 19.4435 1.33398 13.0002C1.33398 6.55684 6.55733 1.3335 13.0007 1.3335C19.444 1.3335 24.6673 6.55684 24.6673 13.0002Z"
        stroke={color}
        strokeWidth="2.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
