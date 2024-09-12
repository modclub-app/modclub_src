import React from 'react';
import classNames from 'classnames/bind';

// Styles
import styles from './styles.scss';
const cn = classNames.bind(styles);

// Components
import { TickerAnimation } from './TickerAnimation';

export const Decor = () => {
  return (
    <div className={cn("decor-container")}>
      <div className={cn("ticker-animation")}>
        <TickerAnimation tickerText="DecideAI" />
      </div>
    </div>

  );
}