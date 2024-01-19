import React from "react";
import data from "@/api/data.json";
import { Typography } from "@/components/uikit";

export const Heading = () => (
  <Typography tag="h1" weight="medium" size="3xl">
    <span>
      {data.greetingBlock.title}
      <span className="text-vivid-color block">
        {data.greetingBlock.actionWord}
      </span>
    </span>
  </Typography>
);
