import React from "react";
import { Heading } from "@/interfaces/GreetingBlock/Heading";
import { Info } from "@/interfaces/GreetingBlock/Info";
import { Container } from "@/components/layout";
import data from "@/api/data.json";

export const GreetingBlock = () => (
  <Container
    view="center"
    image={data.greetingBlock.image}
    imageSet={data.greetingBlock.imageSet}
    bg="gradient"
    heading={<Heading />}
    info={<Info />}
  />
);
