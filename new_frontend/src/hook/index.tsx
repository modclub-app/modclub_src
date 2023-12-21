import { useState } from "react";

type Direction = "left" | "right";

export const useCurrentItem = (defaultIndex: number, arrayLength: number) => {
  const [activeItem, setActiveItem] = useState<number>(defaultIndex);
  const slidesLength = arrayLength;

  const useSetCurrentItem = (direction: Direction) => {
    let currentItem = activeItem;
    if (direction === "left") {
      currentItem = currentItem === 1 ? slidesLength : currentItem - 1;
    } else if (direction === "right") {
      currentItem = currentItem === slidesLength ? 1 : currentItem + 1;
    }

    setActiveItem(currentItem);
  };

  return { activeItem, useSetCurrentItem };
};
