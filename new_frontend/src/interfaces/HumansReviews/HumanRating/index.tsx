import React from "react";
import { Picture, Rating, Typography } from "@/components/uikit";

type RatingTypes = {
  stars: number;
  name: string;
  image: string;
};

export const HumanRating: React.FC<RatingTypes> = ({ image, name, stars }) => (
  <div className="flex items-center">
    <Picture className="max-w-[80px]" src={image} alt={name} />
    <div className="ml-5">
      <Rating rating={stars} />
      <Typography tag="div" size="2sm">
        {name}
      </Typography>
    </div>
  </div>
);
