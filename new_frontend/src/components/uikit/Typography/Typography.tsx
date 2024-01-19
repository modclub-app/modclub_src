import React from "react";
import { Lato } from "next/font/google";
import cn from "classnames";

const latoFontBold = Lato({ weight: "900", subsets: ["latin"] });
const latoFontMedium = Lato({ weight: "700", subsets: ["latin"] });
const latoFontRegular = Lato({ weight: "400", subsets: ["latin"] });
const latoFontLight = Lato({ weight: "300", subsets: ["latin"] });

type TypographyProps = {
  tag?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  size?: "sm" | "2sm" | "lg" | "xl" | "2xl" | "3xl";
  weight?: "light" | "regular" | "medium" | "bold";
  children: React.ReactNode | string;
};

export const Typography: React.FC<TypographyProps> = ({
  tag = "p",
  size = "sm",
  weight = "regular",
  children,
}) => {
  const Tag = tag;
  return (
    <Tag
      className={cn({
        "text-3xl sm:text-4xl md:text-5xl lg:text-6xl": size === "3xl",
        "text-2xl sm:text-3xl md:text-4xl lg:text-5xl": size === "2xl",
        "text-xl sm:text-2xl md:text-3xl lg:text-4xl": size === "xl",
        "text-lg sm:text-xl md:text-2xl lg:text-3xl": size === "lg",
        "text-sm sm:text-base md:text-md lg:text-lg": size === "2sm",
        "text-sm sm:text-base md:text-md": size === "sm",
        [latoFontBold.className]: weight === "bold",
        [latoFontMedium.className]: weight === "medium",
        [latoFontRegular.className]: weight === "regular",
        [latoFontLight.className]: weight === "light",
      })}
    >
      {children}
    </Tag>
  );
};
