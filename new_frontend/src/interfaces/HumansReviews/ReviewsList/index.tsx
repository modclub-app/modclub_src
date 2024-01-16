import React from "react";
import cn from "classnames";
import { HumanReview } from "@/interfaces/HumansReviews/HumanReview";
import { ArrowButton } from "@/interfaces/HumansReviews/ArrowButton";
import { Typography } from "@/components/uikit";
import data from "@/api/data.json";
import { useCurrentItem } from "@/hook";

export const ReviewList = () => {
  const slidesLength = data.humanReview.length;
  const { activeItem, useSetCurrentItem } = useCurrentItem(1, slidesLength);

  return (
    <div className="md:relative">
      <ul className="md:absolute">
        {data.humanReview.map((item, index) => (
          <li
            key={item.title}
            className={cn({
              block: activeItem - 1 === index,
              hidden: activeItem - 1 !== index,
            })}
          >
            <HumanReview {...item} />
          </li>
        ))}
      </ul>

      {slidesLength > 1 && (
        <div className="mt-4 flex items-center md:mt-0 md:absolute md:top-[-40px] md:left-0">
          <ArrowButton
            arrowType="left"
            onClick={() => useSetCurrentItem("left")}
          />
          <Typography tag="span" size="sm">
            {`${activeItem} / ${slidesLength}`}
          </Typography>
          <ArrowButton
            arrowType="right"
            onClick={() => useSetCurrentItem("right")}
          />
        </div>
      )}
    </div>
  );
};
