import React from "react";
import cn from "classnames";
import { Typography } from "@/components/uikit";
import { ParagraphList } from "./ParagraphList";
import { ListItem } from "../types";

type ContentTypes = {
  dataList: ListItem[];
  activeAlias: string;
};

export const Content: React.FC<ContentTypes> = ({ dataList, activeAlias }) => (
  <div className="col-start-1 col-end-9 md:pt-4 md:col-start-6 md:col-end-12">
    <ul className="md:sticky md:top-4">
      {dataList.map((item, index) => (
        <li
          key={index}
          className={cn("mb-5 inline-block list-none md:mb-0", {
            "md:inline-block": activeAlias === item.alias,
            "md:hidden": activeAlias !== item.alias,
          })}
        >
          {item.title && (
            <div className={cn("mb-4")}>
              <Typography size="xl" tag="h4">
                {item.title}
              </Typography>
            </div>
          )}
          <ParagraphList paragraph={item.paragraph} />
        </li>
      ))}
    </ul>
  </div>
);
