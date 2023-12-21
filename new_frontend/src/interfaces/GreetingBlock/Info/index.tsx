import React from "react";
import data from "@/api/data.json";
import { Link, Typography } from "@/components/uikit";

export const Info = () => (
  <div className="pt-5 pb-10 lg:pt-10 lg:pb-20">
    <div className="pb-5 lg:pb-10">
      <Typography size="2sm" weight="light">
        {data.greetingBlock.description}
      </Typography>
    </div>
    <Link
      bg="vivid"
      linkText={data.greetingBlock.link.text}
      href={data.greetingBlock.link.href}
      size="large"
    />
  </div>
);
