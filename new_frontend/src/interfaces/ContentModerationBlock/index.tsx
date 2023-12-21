import React from "react";
import { Container } from "@/components/layout";
import { Heading } from "@/interfaces/ContentModerationBlock/Heading";
import { Info } from "@/interfaces/ContentModerationBlock/Info";
import data from "@/api/data.json";

export const ContentModerationBlock = () => (
  <Container
    view="hybrid"
    image={data.contentModeration.image}
    imageSet={data.contentModeration.imageSet}
    bg="green"
    heading={<Heading />}
    info={<Info />}
  />
);
