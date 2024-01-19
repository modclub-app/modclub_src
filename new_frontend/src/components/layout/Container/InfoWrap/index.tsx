import React from "react";
import cn from "classnames";
import { WrapProps } from "../types";

export const InfoWrap: React.FC<WrapProps> = ({ view, children }) => (
  <div
    className={cn({
      "md:w-1/2 lg:w-1/3": view === "hybrid",
      "md:w-1/2": view === "stretch",
      "text-center": view === "center",
    })}
  >
    {children}
  </div>
);
