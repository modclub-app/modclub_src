import React from 'react';
import classNames from 'classnames/bind';

// Styles
import styles from './styles.scss';
const cn = classNames.bind(styles);

// Components
import { LogoWithTextSvg } from '../LogoSvg';
import { InfoAbout } from './InfoAbout';

export const TopBar = () => {
  const isTag = process.env.DEV_ENV !== "production" && process.env.DEV_ENV !== "prod";
  return (
    <div className={cn("topbar")}>
      <div className={cn("topbar-logo")}>
        <LogoWithTextSvg />
        {isTag && (
          <span className={cn("topbar-tag")}>
            {process.env.DEPLOYMENT_TAG
              ? process.env.DEPLOYMENT_TAG
              : process.env.DEV_ENV}
          </span>
        )}
      </div>

      <InfoAbout />
    </div>
  );
}