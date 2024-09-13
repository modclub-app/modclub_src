import React from 'react';
import classNames from 'classnames/bind';

// Styles
import styles from './styles.scss';
const cn = classNames.bind(styles);

export const DecideIdDecore: React.FC<{ animate?: boolean }> = ({ animate }) => (
  <div className={cn("decideid", { "animate": animate })}>
    <div className={cn("square", "_square1")} />
    <div className={cn("square", "_square2")} />
    <div className={cn("square", "_square3")} />
    <div className={cn("decideid-circle")} />
  </div>
);
