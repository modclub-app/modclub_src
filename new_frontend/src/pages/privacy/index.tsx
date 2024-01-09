import React from "react";
import { Grid } from "@/components/layout";
import { Heading } from "@/interfaces/Policies/Heading";
import { MenuSwitchHoc } from "@/interfaces/Policies/MenuSwitchHoc";
import { PoliciesContext } from "@/interfaces/Policies/PoliciesContext";
import privacyData from "@/api/privacy.json";

export default function Privacy() {
  return (
    <PoliciesContext.Provider value={privacyData}>
      <div className="p-5 w-full">
        <Grid>
          <Heading />
          <MenuSwitchHoc />
        </Grid>
      </div>
    </PoliciesContext.Provider>
  );
}
