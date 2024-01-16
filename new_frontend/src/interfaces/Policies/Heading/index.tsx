import React, { useContext } from "react";
import { Typography } from "@/components/uikit";
import { Paragraph } from "../Content/Pragraph";
import { PoliciesContext } from "../PoliciesContext";
import { Paragraph as ParagraphTypes } from "../types";

export const Heading = () => {
  const { title, subTitle, paragraph } = useContext(PoliciesContext);
  return (
    <div className="relative pb-4 col-start-1 col-end-9 md:col-start-2 md:col-end-10">
      <Typography size="xl" tag="h2">
        {title}
      </Typography>

      <div className="mt-2 pb-4">
        <Typography size="2sm" tag="h3">
          {subTitle}
        </Typography>
      </div>

      <div className="absolute w-8 h-[1px] bg-grey-3-color t-0 l-0" />

      {paragraph && (
        <ul>
          {paragraph.map((item: ParagraphTypes, index) => (
            <li key={index}>
              <Paragraph {...item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
