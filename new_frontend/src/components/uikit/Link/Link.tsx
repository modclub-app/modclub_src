import React from "react";
import cn from "classnames";
import { Typography } from "../../uikit";

type LinkProps = {
  linkText: string;
  href: string;
  size?: "large";
  bg?: "vivid" | "black";
};

export const Link: React.FC<LinkProps> = ({ linkText, href, bg, size }) => (
  <a
    target="_blank"
    href={href}
    className={cn("inline-block rounded-md", {
      "bg-vivid-color hover:bg-vivid-color-hover text-white-color":
        bg === "vivid",
      "bg-black-color hover:bg-black-color-hover text-white-color":
        bg === "black",
      "text-black-color hover:underline": !bg,
      "py-4 px-8": size === "large",
      "py-3 px-6": size != "large",
    })}
    rel="noreferrer"
  >
    <Typography tag="span" size={size === "large" ? "2sm" : "sm"}>
      {linkText}
    </Typography>
  </a>
);
