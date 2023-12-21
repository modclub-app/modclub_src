import React from "react";
import { Typography } from "@/components/uikit";

type AdvantageItemProps = {
  title: string;
  description: string;
  image?: string | null;
};

export const AdvantageItem: React.FC<AdvantageItemProps> = ({
  title,
  description,
  image,
}) => (
  <div className="text-center md:text-left">
    <Typography tag="h4" size="lg">
      {title}
    </Typography>
    {description && (
      <Typography tag="p" size="sm">
        {description}
      </Typography>
    )}
    {image && (
      <div className="flex justify-center pt-10 block md:pt-0 md:hidden">
        <img src={image} alt={title} />
      </div>
    )}
  </div>
);
