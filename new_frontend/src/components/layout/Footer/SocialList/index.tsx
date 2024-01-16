import React from "react";
import data from "@/api/data.json";
import { DiscordIcon, MediumIcon, TwitterIcon } from "@/components/uikit";

const social = {
  twitter: TwitterIcon,
  discord: DiscordIcon,
  medium: MediumIcon,
};

export const SocialList = () => (
  <ul className="flex items-center">
    {data.footer.social.map((item) => {
      const SocialComponent = social[item.name as keyof typeof social];
      return (
        <li className="mx-2" key={item.name}>
          <a href={item.href} target="_blank" rel="noreferrer">
            <SocialComponent width={28} height={28} />
          </a>
        </li>
      );
    })}
  </ul>
);
