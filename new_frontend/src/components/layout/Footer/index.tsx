import React from "react";
import { JewelryIcon } from "@/components/uikit";
import { SocialList } from "./SocialList";
import { MainWrap } from "./MainWrap";
import { Info } from "./Info";
import { Policies } from "./Policies";

export const Footer = () => (
  <MainWrap>
    <React.Fragment>
      <div className="md:flex items-center justify-between">
        <div className="md:w-1/2">
          <SocialList />
          <Info />
        </div>

        <div className="mt-5 md:mt-0 md:w-1/2 md:flex md:justify-end">
          <JewelryIcon
            viewBox="0 0 145 90"
            width={145}
            height={90}
            fill="#5651FF"
          />
        </div>
      </div>
      <Policies />
    </React.Fragment>
  </MainWrap>
);
