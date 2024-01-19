import React from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/uikit";

type ArrowButtonProps = {
  arrowType: string;
  onClick: () => void;
};

export const ArrowButton: React.FC<ArrowButtonProps> = ({
  arrowType,
  onClick,
}) => (
  <button onClick={onClick}>
    {arrowType === "left" && <ArrowLeftIcon fill="#5651FF" />}
    {arrowType === "right" && <ArrowRightIcon fill="#5651FF" />}
  </button>
);
