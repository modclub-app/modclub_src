import React from "react";
import { Typography } from "@/components/uikit";
import data from "@/api/data.json";

export const Info = () => (
  <div className="pt-10">
    <Typography tag="div" size="sm">
      {data.footer.copyright}
    </Typography>
    <div className="mt-5">
      <Typography tag="div" size="sm">
        {data.footer.address}
      </Typography>
    </div>
  </div>
);
