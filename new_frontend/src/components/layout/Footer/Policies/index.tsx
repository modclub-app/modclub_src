import React from "react";
import { Typography } from "@/components/uikit";

const policiesLinks = [
  {
    link: "/privacy",
    text: "Privacy",
  },
  {
    link: "/terms",
    text: "Terms",
  },
];

export const Policies = () => (
  <div className="pt-4 mt-8 border-t-[1px] border-grey-2-color flex">
    {policiesLinks.map((item) => (
      <a
        href={item.link}
        key={item.text}
        className="text-grey-3-color pr-2 hover:text-vivid-color-hover"
      >
        <Typography size="sm">{item.text}</Typography>
      </a>
    ))}
  </div>
);
