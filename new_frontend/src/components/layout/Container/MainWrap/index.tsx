import React from "react";
import cn from "classnames";
import { WrapProps } from "../types";

export const MainWrap: React.FC<WrapProps> = ({ view, children }) => (
  <div
    className={cn(
      "pt-10 col-start-1 col-end-12 pl-5 pr-5 md:p-0 md:pt-28 md:col-start-2",
      {
        "flex flex-col text-center md:text-left md:flex-row md:flex-wrap":
          view === "hybrid" || view === "stretch",
        "col-start-1 md:col-span-13 md:col-end-13": view === "hybrid",
        "md:col-end-12": view != "hybrid",
      }
    )}
  >
    {children}
  </div>
);
