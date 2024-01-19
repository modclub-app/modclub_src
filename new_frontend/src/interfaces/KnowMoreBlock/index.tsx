import React from "react";
import { Typography } from "@/components/uikit";
import { BgWrap } from "@/components/layout";
import { MainWrap } from "@/interfaces/KnowMoreBlock/MainWrap";
import { KnowMoreList } from "@/interfaces/KnowMoreBlock/KnowMoreList";
import data from "@/api/data.json";

export const KnowMoreBlock = () => (
  <BgWrap bg="gray">
    <MainWrap>
      <Typography tag="h2" size="2xl">
        {data.knowMore.title}
      </Typography>

      <KnowMoreList />
    </MainWrap>
  </BgWrap>
);
