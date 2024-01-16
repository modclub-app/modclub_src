import React from "react";
import cn from "classnames";
import { WrapProps } from "../types";

export const ImageWrap: React.FC<WrapProps> = ({ view, children }) => (
  <div
    className={cn({
      "md:w-1/2 lg:w-2/3": view === "hybrid",
      "w-full": view === "stretch",
    })}
  >
    {children}
  </div>
);
