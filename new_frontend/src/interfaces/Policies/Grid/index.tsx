import React from "react";

type GridTypes = {
  children: React.ReactNode;
};

export const Grid: React.FC<GridTypes> = ({ children }) => (
  <div className="mx-auto grid grid-cols-8 gap-5 bg-white md:px-7.5 md:grid-cols-12">
    {children}
  </div>
);
