import React from 'react';
import { motion } from "framer-motion";
import classNames from 'classnames/bind';

// Styles
import styles from './styles.scss';
const cn = classNames.bind(styles);

export const SubTitle = () => (
  <motion.div
    className={cn('subtitle')}
    key="floatingUpAnimation"
    variants={{
      hidden: { opacity: 0, y: 25 },
      visible: { opacity: 1, y: 0 },
    }}
    initial="hidden"
    animate={"visible"}
    transition={{ duration: 0.7, delay: 0.5 }}
  >
    A platform to collect & refine data, and train your market-leading LLM.
  </motion.div>
);