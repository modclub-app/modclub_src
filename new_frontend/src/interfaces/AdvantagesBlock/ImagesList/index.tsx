import React from "react";
import { ImageItem } from "@/interfaces/AdvantagesBlock/ImageItem";
import cn from "classnames";
import data from "@/api/data.json";

type ImagesListProps = {
  active: string;
};

export const ImagesList: React.FC<ImagesListProps> = ({ active }) => (
  <ul className="hidden md:w-1/2 md:block">
    {data.advantages.advantagesList.map((item) => (
      <li
        key={item.title}
        className={cn({
          block: item.title === active,
          hidden: item.title !== active,
        })}
      >
        {item.image && <ImageItem {...item} />}
      </li>
    ))}
  </ul>
);
