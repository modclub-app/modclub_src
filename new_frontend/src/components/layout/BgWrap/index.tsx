import React from "react";
import cn from "classnames";
import { BgProps } from "../Container/types";

export const BgWrap: React.FC<BgProps> = ({ children, bg }) => (
  <div
    className={cn({
      "bg-gradient-to-t from-white to-white-gradient-color": bg === "gradient",
      "bg-green-color": bg === "green",
      "bg-yellow-color": bg === "yellow",
      "bg-gray-color": bg === "gray",
    })}
  >
    {children}
  </div>
);
