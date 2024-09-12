import React from "react";
import classNames from "classnames/bind";

// Styles
import styles from './styles.scss';
const cn = classNames.bind(styles);

// Components
import { Section } from './Section';
import { LogoTagline } from './LogoTagline';
import { Decor }  from './Decor';
import { ExploreDecideAI } from './ExploreDecideAI';
import { LinksList } from './LinksList';
import { BackCopyright } from './BackCopyright';

export const Footer = () => (
  <div className={cn("footer")}>
    <div className={cn("footer-wrapper")}>
      <Section>
        <LogoTagline />
      </Section>
    </div>

    <Decor />

    <div className={cn("footer-wrapper")}>
      <Section>
        <div className={cn("footer-explore")}>
          <ExploreDecideAI />

          <div className={cn("links-section")}>
            <LinksList />
            <BackCopyright />
          </div>
        </div>
      </Section>
    </div>
  </div>
);