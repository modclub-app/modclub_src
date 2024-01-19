import React from "react";
import { ItemButton } from "./ItemButton";
import { ListItem } from "../types";

type SidebarTypes = {
  dataList: ListItem[];
  activeAlias: string;
  onClick: (alias: string) => void;
};

export const Sidebar: React.FC<SidebarTypes> = ({
  dataList,
  activeAlias,
  onClick,
}) => (
  <div className="hidden md:inline-block md:col-start-2 md:col-end-6">
    <ul>
      {dataList.map((item) => (
        <li key={item.alias} className="pb-4">
          <ItemButton
            onClick={() => onClick(item.alias)}
            buttonText={item.title}
            isActive={activeAlias === item.alias}
          />
        </li>
      ))}
    </ul>
  </div>
);
