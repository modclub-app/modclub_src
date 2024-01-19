import React from "react";
import { Heading } from "@/interfaces/AdvantagesBlock/Heading";
import { MainWrap } from "@/interfaces/AdvantagesBlock/MainWrap";
import { ElementSwitchComponent } from "./ElementSwitchComponent";

export const AdvantagesBlock = () => (
  <MainWrap>
    <Heading />
    <div className="flex flex-row mt-20">
      <ElementSwitchComponent />
    </div>
  </MainWrap>
);
