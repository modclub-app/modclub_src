import React from "react";
import { Grid } from "@/components/layout";

type MainWrapProps = {
  children: React.ReactNode;
};

export const MainWrap: React.FC<MainWrapProps> = ({ children }) => (
  <Grid>
    <div className="py-10 px-5 col-start-1 col-end-12 md:p-0 md:py-20 md:col-start-2 md:col-end-12">
      {children}
    </div>
  </Grid>
);
