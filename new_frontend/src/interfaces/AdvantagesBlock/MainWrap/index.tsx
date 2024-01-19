import React from "react";
import { Grid } from "@/components/layout";

type MainWrapProps = {
  children: React.ReactNode;
};

export const MainWrap: React.FC<MainWrapProps> = ({ children }) => (
  <div className="mx-auto p-5 pt-10 md:pt-28">
    <div className="border-4 rounded-4xl border-solid border-black">
      <Grid>
        <div className="py-10 px-5 md:px-0 md:py-20 col-start-1 col-end-12 md:col-start-2 md:col-end-12 md:ml-[-20px] md:mr-[-20px]">
          {children}
        </div>
      </Grid>
    </div>
  </div>
);
