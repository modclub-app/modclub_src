import React, { useState, ComponentType, useContext } from "react";
import { Sidebar } from "../Sidebar";
import { Content } from "../Content";
import { ListItem } from "../types";
import { PoliciesContext } from "../PoliciesContext";

type MainProps = {
  dataList: ListItem[];
  activeAlias: string;
};

type SidebarProps = MainProps & {
  onClick: (alias: string) => void;
};

export function withElementSwitch(
  MenuListComponent: ComponentType<SidebarProps>,
  ContentComponent: ComponentType<MainProps>
) {
  const WrappedComponent: React.FC = () => {
    const { list } = useContext(PoliciesContext);
    const [activeItem, setActiveItem] = useState<string>(list[0].alias);
    const handleActiveItemClick = (alias: string) => setActiveItem(alias);
    return (
      <>
        <MenuListComponent
          dataList={list}
          activeAlias={activeItem}
          onClick={handleActiveItemClick}
        />
        <ContentComponent dataList={list} activeAlias={activeItem} />
      </>
    );
  };

  return WrappedComponent;
}

export const MenuSwitchHoc = withElementSwitch(Sidebar, Content);
