import React from "react";
import { Grid } from "@/components/layout";

type MainWrap = {
  children: React.ReactElement;
};

export const MainWrap: React.FC<MainWrap> = ({ children }) => (
  <div className="py-10 px-5 md:px-0 md:py-20">
    <Grid>
      <div className="col-start-1 col-end-12 md:col-start-2 md:col-end-12">
        {children}
      </div>
    </Grid>
  </div>
);
