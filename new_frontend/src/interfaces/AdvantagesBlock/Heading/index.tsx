import React from "react";
import { JewelryIcon, Typography } from "@/components/uikit";
import data from "@/api/data.json";

export const Heading = () => (
  <div className="flex flex-col items-center text-center md:flex-row-reverse md:justify-between md:text-left">
    <JewelryIcon viewBox="0 0 145 90" width={145} height={90} fill="#5651FF" />
    <div className="pt-5 md:pt-0 md:mr-5">
      <Typography tag="h2" size="2xl">
        {data.advantages.title}
      </Typography>
      <Typography tag="p" size="2sm">
        {data.advantages.description}
      </Typography>
    </div>
  </div>
);
