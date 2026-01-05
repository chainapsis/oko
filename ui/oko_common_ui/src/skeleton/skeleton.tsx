import type { FC } from "react";

import "./skeleton.scss";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

export const Skeleton: FC<SkeletonProps> = ({
  width = "100%",
  height = "1em",
  borderRadius = "12px",
  className = "",
}) => {
  const style = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    borderRadius:
      typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
  };

  return <div className={`skeleton ${className}`} style={style} />;
};
