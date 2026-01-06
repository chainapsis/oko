import type { BasicIconProps } from "./types";

export const SunIcon: React.FC<BasicIconProps> = ({
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
      <g clipPath="url(#clip0_2006_7678)">
        <path
          d="M9.99996 1.6665V3.33317M9.99996 16.6665V18.3332M3.33329 9.99984H1.66663M5.26172 5.2616L4.08321 4.08309M14.7382 5.2616L15.9167 4.08309M5.26172 14.7415L4.08321 15.92M14.7382 14.7415L15.9167 15.92M18.3333 9.99984H16.6666M14.1666 9.99984C14.1666 12.301 12.3011 14.1665 9.99996 14.1665C7.69877 14.1665 5.83329 12.301 5.83329 9.99984C5.83329 7.69865 7.69877 5.83317 9.99996 5.83317C12.3011 5.83317 14.1666 7.69865 14.1666 9.99984Z"
          stroke={color}
          strokeWidth="1.66667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_2006_7678">
          <rect width={size} height={size} fill={color} />
        </clipPath>
      </defs>
    </svg>
  );
};
