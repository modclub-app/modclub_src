import React from "react";
import { AdvantageItem } from "@/interfaces/AdvantagesBlock/AdvantageItem";
import cn from "classnames";
import data from "@/api/data.json";

type AdvantagesList = {
  onClick?: (title: string) => void;
  active: string;
};

export const AdvantagesList: React.FC<AdvantagesList> = ({
  onClick,
  active,
}) => (
  <ul className="mr-0 md:mr-10 md:w-1/2">
    {data.advantages.advantagesList.map((item) => (
      <li
        onClick={onClick && (() => onClick(item.title))}
        key={item.title}
        className={cn(
          "pb-14 cursor-pointer pointer-events-none md:pointer-events-auto md:hover:opacity-80",
          {
            "md:opacity-100": item.title === active,
            "md:opacity-50": item.title !== active,
          }
        )}
      >
        <AdvantageItem {...item} />
      </li>
    ))}
  </ul>
);
