import React from "react";
import data from "@/api/data.json";
import { Typography } from "@/components/uikit";

export const Heading = () => (
  <div className="md:mb-10">
    <Typography tag="p" weight="medium" size="2sm">
      {data.contentModeration.subTitle}
    </Typography>
    <Typography tag="h2" weight="medium" size="3xl">
      {data.contentModeration.title}
    </Typography>
  </div>
);
