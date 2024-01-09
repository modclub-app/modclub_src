import React from "react";
import { Typography } from "@/components/uikit";
import cn from "classnames";

type ItemButton = {
  buttonText: string;
  onClick: () => void;
  isActive: boolean;
};

export const ItemButton: React.FC<ItemButton> = ({
  buttonText,
  onClick,
  isActive,
}) => (
  <button
    onClick={onClick}
    className={cn("text-left item-button transition duration-300", {
      "text-vivid-color": isActive,
      "text-grey-3-color hover:text-black-color-hover": !isActive,
    })}
  >
    <Typography tag="span" size="2sm" weight="regular">
      {buttonText}
    </Typography>
  </button>
);
