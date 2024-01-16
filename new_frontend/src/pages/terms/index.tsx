import React from "react";
import { Grid } from "@/interfaces/Policies/Grid";
import { Heading } from "@/interfaces/Policies/Heading";
import { MenuSwitchHoc } from "@/interfaces/Policies/MenuSwitchHoc";
import { PoliciesContext } from "@/interfaces/Policies/PoliciesContext";
import termsData from "@/api/terms.json";

export default function Terms() {
  return (
    <PoliciesContext.Provider value={termsData}>
      <div className="p-5 w-full">
        <Grid>
          <Heading />
          <MenuSwitchHoc />
        </Grid>
      </div>
    </PoliciesContext.Provider>
  );
}
