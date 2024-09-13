import React from 'react';
import classNames from 'classnames/bind';

// Styles
import styles from './styles.scss';
const cn = classNames.bind(styles);

// Components
import { TickerItem } from '../TickerItem';

export const TickerAnimation: React.FC<{
  tickerText: string;
}> = ({
  tickerText,
}) => {
  const items = new Array(10).fill(null).map((_, index) => (
    <TickerItem text={tickerText} key={index} />
  ));

  return (
    <div className={cn("ticker-container")}>
      <div className={cn("ticker-animate")}>
        {items}
      </div>

      <div className={cn("ticker-animate")} aria-hidden="true">
        {items}
      </div>
    </div>
  );
};