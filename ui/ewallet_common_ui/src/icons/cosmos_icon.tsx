import React from "react";

import { s3BucketURL } from "./paths";

export const CosmosIcon: React.FC<CosmosIconProps> = ({
  width = 16,
  height = 16,
}) => {
  return (
    <img
      src={`${s3BucketURL}/cosmos.png`}
      alt="cosmos_icon"
      width={width}
      height={height}
    />
  );
};

export interface CosmosIconProps {
  width?: number;
  height?: number;
}
