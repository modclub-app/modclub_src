import React from "react";
import { ModclubLogo, Link } from "@/components/uikit";
import data from "@/api/data.json";

export const Navigation = () => (
  <div className="mx-auto p-5 md:px-20 md:py-10 flex justify-between items-center">
    <ModclubLogo adaptive />
    <div className="flex items-center">
      <Link linkText={data.nav.login.text} href={data.nav.login.href} />
      <Link
        linkText={data.nav.actionLink.text}
        href={data.nav.actionLink.href}
        bg="black"
      />
    </div>
  </div>
);
