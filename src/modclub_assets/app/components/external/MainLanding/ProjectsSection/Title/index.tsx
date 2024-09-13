import React from 'react';
import { motion } from "framer-motion";
import classNames from 'classnames/bind';

// Styles
import styles from './styles.scss';
const cn = classNames.bind(styles);

export const Title = () => (
  <motion.h2
    className={cn("title")}
    variants={{
      hidden: { opacity: 0, y: 25 },
      visible: { opacity: 1, y: 0 },
    }}
    initial="hidden"
    animate="visible"
    transition={{ duration: 0.7, delay: 0.2 }}
  >
    Explore Our Projects
  </motion.h2>
);