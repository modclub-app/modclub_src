import React from "react";

export interface ContainerProps {
  view: "hybrid" | "center" | "stretch";
  image: string;
  imageSet: ImageSet[];
  heading: React.ReactNode;
  info: React.ReactNode;
  bg: "green" | "yellow" | "gradient" | "gray";
}

export type ImageSet = {
  srcSet: string;
  media: string;
  type: string;
};

export type WrapProps = Pick<ContainerProps, "view"> & {
  children: React.ReactNode;
};

export type BgProps = Pick<ContainerProps, "bg"> & {
  children: React.ReactNode;
};
