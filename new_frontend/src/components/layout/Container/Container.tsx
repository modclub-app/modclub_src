import React from "react";
import { Grid } from "@/components/layout";
import { Picture } from "@/components/uikit";
import { HeadingWrap } from "./HeadingWrap";
import { InfoWrap } from "./InfoWrap";
import { ImageWrap } from "./ImageWrap";
import { MainWrap } from "./MainWrap";
import { BgWrap } from "../BgWrap";
import { ContainerProps } from "./types";

export const Container: React.FC<ContainerProps> = ({
  view,
  heading,
  info,
  image,
  imageSet,
  bg,
}) => (
  <BgWrap bg={bg}>
    <Grid>
      <MainWrap view={view}>
        <HeadingWrap view={view}>{heading}</HeadingWrap>

        <InfoWrap view={view}>{info}</InfoWrap>

        <ImageWrap view={view}>
          <Picture
            className="w-full flex-none"
            src={image}
            sources={imageSet}
            alt="dashboard_main"
          />
        </ImageWrap>
      </MainWrap>
    </Grid>
  </BgWrap>
);
