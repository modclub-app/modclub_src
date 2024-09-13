import React from 'react';
import classNames from 'classnames/bind';

// Styles
import styles from './styles.scss';
const cn = classNames.bind(styles);

// Components
import { LogoWithTextBlackSvg } from '../../../LogoSvg';

export const PopupContent = () => {
  const redirectOnDecideIdLanding = () => {
    if (window) {
      window.open("https://decideai.xyz/protocol", '_blank');
    }
  }

  return (
    <React.Fragment>
      <div className={cn("content-logo")}>
        <LogoWithTextBlackSvg />
      </div>
      <div className={cn("content-wrap")}>
        <div className={cn("content-title")}>Decentralized content moderation on the Internet Computer</div>
        <div className={cn("content-text")}>MODCLUB is a decentralized content moderation platform, it simplifies the moderation process by connecting our community to dApps that need UGC moderation.</div>
      </div>
      <div className='max-w-xs'>
        <button 
          className={cn("content-button")}
          onClick={redirectOnDecideIdLanding}
        >
          Read More
        </button>
      </div>
    </React.Fragment>
  );
}