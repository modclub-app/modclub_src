import React, { useState } from "react";
import { DropButton } from "@/interfaces/KnowMoreBlock/DropButton";
import { DropItem } from "@/interfaces/KnowMoreBlock/DropItem";
import data from "@/api/data.json";

type DescriptionListItem = {
  title: string;
  description: string;
};

type KnowMoreListItem = {
  title: string;
  descriptionList?: DescriptionListItem[];
  description?: string;
};

export const KnowMoreList: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const handlerDropButtonClick = (index: number) => {
    const currIndex = index !== activeIndex ? index : -1;
    setActiveIndex(currIndex);
  };

  return (
    <ul className="pt-10">
      {data.knowMore.list.map((item: KnowMoreListItem, index: number) => (
        <li
          className="py-5 border-b border-b-grey-2-color last:border-b-0"
          key={item.title}
        >
          <DropButton
            title={item.title}
            onClick={() => handlerDropButtonClick(index)}
            activeIndex={activeIndex}
            currIndex={index}
          />
          <DropItem {...item} activeIndex={activeIndex} currIndex={index} />
        </li>
      ))}
    </ul>
  );
};
