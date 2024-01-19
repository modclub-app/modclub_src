import React from "react";
import { Paragraph } from "../Pragraph";
import { Paragraph as ParagraphTypes } from "../../types";

type ParagraphListTypes = {
  paragraph: ParagraphTypes[];
};

export const ParagraphList: React.FC<ParagraphListTypes> = ({ paragraph }) => (
  <ul>
    {paragraph.map((paragraphItem, index) => (
      <li className="mt-4 list-none" key={index}>
        <Paragraph {...paragraphItem} />
      </li>
    ))}
  </ul>
);
