import React from 'react';
import classNames from 'classnames/bind';
import { motion } from "framer-motion";

// Styles
import styles from './styles.scss';
const cn = classNames.bind(styles);

// Components
import { LinearCircleSvg } from './LinearCircleSvg';

export const PictureDecor = () => (
  <motion.div
    className={cn('picture-decor')}
    initial={{ scale: 0.85 }}
    animate={{ scale: 1 }}
    transition={{
      scale: { type: "spring", stiffness: 260, damping: 100, duration: 30 },
    }}
  >
    <motion.div 
      initial={{ rotate: 0 }}
      animate={{ rotate: [0, 360] }}
      transition={{
        rotate: { duration: 100, repeat: Infinity, ease: "linear" }
      }}
    >
      <LinearCircleSvg />
    </motion.div>
  </motion.div>
);