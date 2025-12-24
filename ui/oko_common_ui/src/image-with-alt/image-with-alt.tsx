import type { FC } from "react";

interface ImageWithAltProps {
  srcSet: string;
  srcAlt: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
}
export const ImageWithAlt: FC<ImageWithAltProps> = ({
  srcSet,
  srcAlt,
  alt,
  style,
  className,
}) => {
  return (
    <picture>
      <source srcSet={srcSet} type="image/webp" />
      <img src={srcAlt} alt={alt} style={style} className={className} />
    </picture>
  );
};
