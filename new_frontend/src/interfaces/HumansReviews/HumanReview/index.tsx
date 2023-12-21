import React from "react";
import { Typography } from "@/components/uikit";
import { HumanRating } from "@/interfaces/HumansReviews/HumanRating";

type ReviewTypes = {
  title: string;
  description: string;
  rating: RatingTypes;
};

type RatingTypes = {
  stars: number;
  name: string;
  image: string;
};

export const HumanReview: React.FC<ReviewTypes> = ({
  title,
  description,
  rating,
}) => (
  <div className="flex flex-col">
    <Typography tag="div" size="2xl">
      {title}
    </Typography>
    <div className="pt-10 pb-5 md:pt-20 md:pb-10">
      <Typography tag="div" size="2sm">
        {description}
      </Typography>
    </div>

    <HumanRating {...rating} />
  </div>
);
