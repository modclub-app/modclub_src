import React from "react";
import cn from "classnames";
import { Inter } from "next/font/google";
import { ModClubLogoIcon } from "@/components/uikit";

const interFont = Inter({
  subsets: ["latin"],
  weight: "500",
});

type ModclubLogoProps = {
  adaptive?: boolean;
  iconOnly?: boolean;
};

export const ModclubLogo: React.FC<ModclubLogoProps> = ({
  iconOnly,
  adaptive,
}) => (
  <div className="flex items-center">
    <ModClubLogoIcon
      height={28}
      width={28}
      viewBox="0 0 28 28"
      fill="#fff"
      rectFill="#5651FF"
    />
    {!iconOnly && (
      <span
        className={cn("pl-2", interFont.className, {
          "hidden md:block": adaptive,
        })}
      >
        Modclub
      </span>
    )}
  </div>
);
