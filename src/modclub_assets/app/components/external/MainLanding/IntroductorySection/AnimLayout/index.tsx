import React from 'react';
import { motion, useScroll, useTransform } from "framer-motion";
import classNames from 'classnames/bind';

// Components
import { PictureDecor } from './PictureDecor';

// Styles
import styles from './styles.scss';
const cn = classNames.bind(styles);

export const AnimLayout: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const { scrollY } = useScroll();

  const backgroundY = useTransform(scrollY, [0, 500], [0, -100]);
  const contentY = useTransform(scrollY, [0, 500], [0, -200]);

  return (
    <React.Fragment>
      <motion.div
        style={{ y: backgroundY }}
        className={cn('layout-decor')}
      >
        <PictureDecor />
      </motion.div>

      <motion.div
        className={cn('layout-content')}
        style={{ y: contentY }}
      >
        {children}
      </motion.div>
    </React.Fragment>
  )
}