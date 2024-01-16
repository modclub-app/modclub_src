import React from "react";
import { GreetingBlock } from "@/interfaces/GreetingBlock";
import { ContentModerationBlock } from "@/interfaces/ContentModerationBlock";
import { ProofOfHumanityBlock } from "@/interfaces/ProofOfHumanityBlock";
import { AdvantagesBlock } from "@/interfaces/AdvantagesBlock";
import { HumansReviews } from "@/interfaces/HumansReviews";
import { KnowMoreBlock } from "@/interfaces/KnowMoreBlock";

export default function App() {
  return (
    <>
      <GreetingBlock />
      <ContentModerationBlock />
      <ProofOfHumanityBlock />
      <AdvantagesBlock />
      <HumansReviews />
      <KnowMoreBlock />
    </>
  );
}
