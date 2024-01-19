import React from "react";
import data from "@/api/data.json";
import { Link, Typography } from "@/components/uikit";

export const Info = () => (
  <div className="pt-5 pb-10 md:ml-5 md:py-10">
    <div className="pb-10">
      <Typography size="sm" weight="light" tag="div">
        {data.proofOfHumanity.description}
      </Typography>
    </div>
    <Link
      bg="black"
      linkText={data.proofOfHumanity.link.text}
      href={data.proofOfHumanity.link.href}
    />
  </div>
);
