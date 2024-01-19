import React from "react";
import { PictureProps } from "./types";

export const Picture: React.FC<PictureProps> = ({
  src,
  alt,
  sources = [],
  className,
}) => (
  <picture className={className}>
    {sources &&
      sources.map((source, index) => (
        <source
          key={index}
          srcSet={source.srcSet}
          media={source.media}
          type={source.type}
        />
      ))}
    <img src={src} alt={alt} />
  </picture>
);
