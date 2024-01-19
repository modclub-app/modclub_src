import React from "react";

type GridProps = {
  children: React.ReactNode;
};

export const Grid: React.FC<GridProps> = ({ children }) => (
  <div className="mx-auto grid grid-cols-8 gap-5 md:grid-cols-12">
    {children}
  </div>
);
