import React from 'react';
import classNames from 'classnames/bind';

// Styles
import styles from './styles.scss';
const cn = classNames.bind(styles);

export const Section: React.FC<{ 
  children: React.ReactNode; 
}> = ({ 
  children,
}) => (
  <section className={cn("section")}>
    {children}
  </section>
);