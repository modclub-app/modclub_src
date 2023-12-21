import React from "react";
import data from "@/api/data.json";
import { Link, Typography } from "@/components/uikit";

export const Info = () => (
  <div className="pt-5 pb-10 md:pt-0 md:mr-10 lg:mr-20">
    <div className="pb-10">
      <Typography size="sm" weight="light" tag="div">
        <p
          dangerouslySetInnerHTML={{
            __html: data.contentModeration.description,
          }}
        />
      </Typography>
    </div>
    <Link
      bg="black"
      linkText={data.contentModeration.link.text}
      href={data.contentModeration.link.href}
    />
  </div>
);
