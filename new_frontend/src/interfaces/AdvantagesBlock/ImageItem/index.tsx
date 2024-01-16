import React from "react";

type ImageItem = {
  image: string;
  title: string;
};

export const ImageItem: React.FC<ImageItem> = ({ image, title }) => (
  <div className="flex justify-end">
    <img src={image} alt={title} />
  </div>
);
