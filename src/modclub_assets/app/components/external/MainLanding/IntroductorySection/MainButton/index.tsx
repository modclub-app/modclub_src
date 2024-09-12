import React from 'react';
import { motion } from "framer-motion";
import classNames from 'classnames/bind';

// Styles
import styles from './styles.scss';
const cn = classNames.bind(styles);

export const MainButton: React.FC<{
  onClick: () => void;
  buttonText: string;
}> = ({ 
  onClick,
  buttonText,
}) => (
  <motion.button 
    onClick={onClick}
    className={cn("main-button")}
    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 }}}
    initial="hidden"
    animate="visible"
    transition={{ duration: 0.7, delay: 1 }}
  >
    {buttonText}
  </motion.button>
);