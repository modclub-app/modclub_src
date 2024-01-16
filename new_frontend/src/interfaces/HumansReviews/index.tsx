import React from "react";
import { QuotesIcon } from "@/components/uikit";
import { MainWrap } from "@/interfaces/HumansReviews/MainWrap";
import { ReviewList } from "@/interfaces/HumansReviews/ReviewsList";

export const HumansReviews = () => (
  <MainWrap
    reviewIcon={
      <QuotesIcon width={74} height={56} viewBox="0 0 74 56" fill="#5651FF" />
    }
    reviewSlider={<ReviewList />}
  />
);
