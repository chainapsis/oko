import React from "react";

import { s3BucketURL } from "./paths";

export const MetamaskIcon: React.FC<MetamaskIconProps> = ({
  width = 20,
  height = 20,
}) => {
  return (
    <img
      src={`${s3BucketURL}/metamask.png`}
      alt="metamask_icon"
      width={width}
      height={height}
    />
  );
};

export interface MetamaskIconProps {
  width?: number;
  height?: number;
}
