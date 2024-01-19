import React, { useState, ComponentType } from "react";
import { AdvantagesList } from "@/interfaces/AdvantagesBlock/AdvantagesList";
import { ImagesList } from "@/interfaces/AdvantagesBlock/ImagesList";

type ListComponentProps = {
  active: string;
  onClick?: (alias: string) => void;
};

export function withElementSwitch(
  AdvantagesListComponent: ComponentType<ListComponentProps>,
  ImagesListComponent: ComponentType<ListComponentProps>
) {
  const WrappedComponent: React.FC = () => {
    const [activeItem, setActiveItem] = useState<string>("Cost-Effective");
    const handleAdvantagesClick = (alias: string) => setActiveItem(alias);
    return (
      <>
        <AdvantagesListComponent
          active={activeItem}
          onClick={handleAdvantagesClick}
        />
        <ImagesListComponent active={activeItem} />
      </>
    );
  };

  return WrappedComponent;
}

export const ElementSwitchComponent = withElementSwitch(
  AdvantagesList,
  ImagesList
);
