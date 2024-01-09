import React from "react";
import cn from "classnames";
import { Typography } from "@/components/uikit";

type DescriptionList = {
  title: string;
  description: string;
};

type DropItemProps = {
  activeIndex: number;
  currIndex: number;
  description?: string;
  descriptionList?: DescriptionList[];
};

export const DropItem: React.FC<DropItemProps> = ({
  activeIndex,
  description,
  currIndex,
  descriptionList,
}) => (
  <div
    className={cn({
      "py-2 overflow-visible max-h-5000 opacity-1 transition duration-300":
        currIndex === activeIndex,
      "py-0 overflow-hidden max-h-0 opacity-0 transition duration-300":
        currIndex !== activeIndex,
    })}
  >
    {description && (
      <Typography tag="p" size="sm">
        <span dangerouslySetInnerHTML={{ __html: description }} />
      </Typography>
    )}

    {descriptionList && (
      <ul>
        {descriptionList.map((item) => (
          <li key={item.title} className="py-4 last:pb-0">
            <Typography tag="div" size="lg">
              {item.title}
            </Typography>
            <div className="pt-4">
              <Typography tag="p" size="sm">
                <span dangerouslySetInnerHTML={{ __html: item.description }} />
              </Typography>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);
