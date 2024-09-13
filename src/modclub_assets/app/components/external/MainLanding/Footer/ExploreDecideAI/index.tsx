import React from 'react';
import classNames from 'classnames/bind';

// Styles
import styles from './styles.scss';
const cn = classNames.bind(styles);

// Components
import { SocialIcons } from '../SocialIcons';

export const ExploreDecideAI = () => (
  <div className={cn("container")}>
    <div className={cn("text-wrapper")}>
      <div className={cn("text-block")}>Innovate. Customize. Collaborate.</div>
    </div>

    <div className={cn("link-block")}>
      <a href="https://decideai.gitbook.io/decideai-whitepaper/" className={cn("link-href")}>Find out more</a>
    </div>

    <SocialIcons />
  </div>
);