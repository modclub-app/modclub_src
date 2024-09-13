import React from 'react';
import classNames from 'classnames/bind';

// Styles
import styles from './styles.scss';
const cn = classNames.bind(styles);

const links = [
  {
    name: "PARTNERS",
    alias: "app_landing_partners",
    href: "/",
  },
  {
    name: "Dfinity",
    alias: "app_landing_dfinity",
    href: "https://internetcomputer.org/",
  },
  {
    name: "OpenChat",
    alias: "app_landing_openchat",
    href: "https://oc.app/",
  },
  {
    name: "Nuance",
    alias: "app_landing_nuance",
    href: "https://nuance.xyz/",
  },
];

const extraLinks = [
  {
    name: "FAQ's",
    alias: "app_landing_faq",
    href: "/faq",
  },
  {
    name: "Privacy",
    alias: "app_landing_privacy",
    href: "/privacy",
  },
  {
    name: "Terms",
    alias: "app_landing_terms",
    href: "/terms",
  },
];

export const LinksList = () => (
  <div className={cn("links-container")}>
    <ul className={cn("links-list")}>
      {links.map((item) => (
        <li key={item.name}>
          <a href={item.href} className={cn("links-link")}>
            {item.name}
          </a>
        </li>
      ))}
    </ul>

    <div className={cn("links-devider")}>{"//"}</div>

    <ul className={cn("links-extra")}>
      {extraLinks.map((item) => (
        <li key={item.name}>
          <a href={item.href} className={cn("links-link")}>
            {item.name}
          </a>
        </li>
      ))}
    </ul>
  </div>
);
