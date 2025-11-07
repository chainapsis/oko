import type { BasicIconProps } from "./types";

export const EyeIcon: React.FC<BasicIconProps> = ({
  className,
  color = "currentColor",
  size = 20,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 17"
      fill="none"
      className={className}
      width={size}
      height={size}
    >
      <path
        d="M1.61342 8.97562C1.52262 8.83186 1.47723 8.75998 1.45182 8.64911C1.43273 8.56583 1.43273 8.4345 1.45182 8.35122C1.47723 8.24035 1.52262 8.16847 1.61341 8.02471C2.36369 6.83672 4.59693 3.8335 8.00027 3.8335C11.4036 3.8335 13.6369 6.83672 14.3871 8.02471C14.4779 8.16847 14.5233 8.24035 14.5487 8.35122C14.5678 8.4345 14.5678 8.56583 14.5487 8.64911C14.5233 8.75998 14.4779 8.83186 14.3871 8.97562C13.6369 10.1636 11.4036 13.1668 8.00027 13.1668C4.59693 13.1668 2.36369 10.1636 1.61342 8.97562Z"
        stroke={color}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.00027 10.5002C9.10484 10.5002 10.0003 9.60473 10.0003 8.50016C10.0003 7.39559 9.10484 6.50016 8.00027 6.50016C6.8957 6.50016 6.00027 7.39559 6.00027 8.50016C6.00027 9.60473 6.8957 10.5002 8.00027 10.5002Z"
        stroke={color}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
