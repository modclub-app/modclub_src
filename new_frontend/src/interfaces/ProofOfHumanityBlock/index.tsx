import React from "react";
import { Container } from "@/components/layout";
import { Heading } from "@/interfaces/ProofOfHumanityBlock/Heading";
import { Info } from "@/interfaces/ProofOfHumanityBlock/Info";
import data from "@/api/data.json";

export const ProofOfHumanityBlock = () => (
  <Container
    view="stretch"
    image={data.proofOfHumanity.image}
    imageSet={data.proofOfHumanity.imageSet}
    bg="yellow"
    heading={<Heading />}
    info={<Info />}
  />
);
