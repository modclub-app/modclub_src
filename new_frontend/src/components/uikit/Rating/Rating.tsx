import React from "react";
import { RatingStarIcon } from "@/components/uikit";

type RatingProps = {
  rating: number;
  totalStars?: number;
};

export const Rating: React.FC<RatingProps> = ({ rating, totalStars = 5 }) => {
  const renderStars = () => {
    const stars = [];

    for (let i = 1; i <= totalStars; i++) {
      stars.push(
        <RatingStarIcon
          key={i}
          viewBox="0 0 18 18"
          fill={i <= rating ? "#5651FF" : "#7E7E7E"}
        />
      );
    }

    return stars;
  };

  return <div className="flex items-center">{renderStars()}</div>;
};
