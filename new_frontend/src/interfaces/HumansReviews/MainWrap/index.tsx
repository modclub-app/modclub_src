import React from "react";
import { Grid } from "@/components/layout";

type MainWrap = {
  reviewIcon: React.ReactElement;
  reviewSlider: React.ReactElement;
};

export const MainWrap: React.FC<MainWrap> = ({ reviewIcon, reviewSlider }) => (
  <div className="pt-10 md:pt-28 md:pb-[34rem] md:relative">
    <div className="md:absolute md:w-full md:mb-[50%]">
      <Grid>
        <div className="p-5 col-start-1 col-end-12 flex flex-col md:flex-row md:col-start-2 md:p-0">
          <div className="mb-10 md:mb-0 md:w-1/3">{reviewIcon}</div>
          <div className="md:w-2/3">{reviewSlider}</div>
        </div>
      </Grid>
    </div>
  </div>
);
