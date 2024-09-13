import React from 'react';
import classNames from 'classnames/bind';

// Styles
import styles from './styles.scss';
const cn = classNames.bind(styles);

// Components
import { SingleLogoSvg } from '../../LogoSvg';

export const LogoTagline = () => (
  <div className={cn("tagline-container")}>
    <div className={cn("tagline-logo")}>
      <SingleLogoSvg />
    </div>

    <div className={cn("tagline-info")}>
      <div className={cn("tagline-text")}>
        Unlock your full potential with AI.
      </div>
    </div>
  </div>
);
