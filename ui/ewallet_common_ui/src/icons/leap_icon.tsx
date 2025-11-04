import React from "react";

import { s3BucketURL } from "./paths";

export const LeapIcon: React.FC<LeapIconProps> = ({
  width = 20,
  height = 20,
}) => {
  return (
    <img
      src={`${s3BucketURL}/leap.png`}
      alt="leap_icon"
      width={width}
      height={height}
    />
  );
};

export interface LeapIconProps {
  width?: number;
  height?: number;
}
