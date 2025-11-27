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
            <path
                d="M16.5 21L19.5 24L25.5 18M31 21C31 26.5228 26.5228 31 21 31C15.4772 31 11 26.5228 11 21C11 15.4772 15.4772 11 21 11C26.5228 11 31 15.4772 31 21Z"
                stroke="#DC6803"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
