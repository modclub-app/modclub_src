import React from "react";
import { CrossIcon, Typography } from "@/components/uikit";
import cn from "classnames";

type DropButtonProps = {
  onClick: (index: number) => void;
  activeIndex: number;
  title: string;
  currIndex: number;
};

export const DropButton: React.FC<DropButtonProps> = ({
  onClick,
  activeIndex,
  title,
  currIndex,
}) => (
  <div className="flex items-center justify-between relative">
    <button
      className="absolute top-0 bottom-0 left-0 right-0 w-full h-full"
      onClick={() => onClick(currIndex)}
    />
    <Typography tag="h4" size="lg">
      {title}
    </Typography>
    <div
      className={cn("transition duration-300 pointer-events-none", {
        "rotate-45": currIndex === activeIndex,
        "rotate-0": currIndex !== activeIndex,
      })}
    >
      <CrossIcon />
    </div>
  </div>
);
