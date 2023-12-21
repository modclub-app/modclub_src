import React from "react";
import cn from "classnames";
import { WrapProps } from "../types";

export const HeadingWrap: React.FC<WrapProps> = ({ view, children }) => (
  <div
    className={cn({
      "w-full": view === "hybrid",
      "text-center": view === "center",
      "md:w-1/2": view === "stretch",
    })}
  >
    {children}
  </div>
);
