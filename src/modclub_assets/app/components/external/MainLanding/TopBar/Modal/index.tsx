import React from 'react';
import classNames from 'classnames/bind';
import { motion, AnimatePresence } from "framer-motion";

// Styles
import styles from './styles.scss';
const cn = classNames.bind(styles);

// Components
import { OutsideClick } from './OutsideClick';

export const Modal: React.FC<{
  children: React.ReactNode;
  closeModal: () => void;
}> = ({ 
  children,
  closeModal 
}) => (
  <AnimatePresence>
    <div className={cn("modal")}>
      <OutsideClick onClick={closeModal}>
        <motion.div 
          className={cn("modal-wrapper")}
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        >
          {children}

          <button 
            onClick={closeModal}
            className={cn("modal-close")}
          >
            <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.781 18.2198C19.8507 18.2895 19.906 18.3722 19.9437 18.4632C19.9814 18.5543 20.0008 18.6519 20.0008 18.7504C20.0008 18.849 19.9814 18.9465 19.9437 19.0376C19.906 19.1286 19.8507 19.2114 19.781 19.281C19.7114 19.3507 19.6286 19.406 19.5376 19.4437C19.4465 19.4814 19.349 19.5008 19.2504 19.5008C19.1519 19.5008 19.0543 19.4814 18.9632 19.4437C18.8722 19.406 18.7895 19.3507 18.7198 19.281L12.5004 13.0607L6.28104 19.281C6.14031 19.4218 5.94944 19.5008 5.75042 19.5008C5.55139 19.5008 5.36052 19.4218 5.21979 19.281C5.07906 19.1403 5 18.9494 5 18.7504C5 18.5514 5.07906 18.3605 5.21979 18.2198L11.4401 12.0004L5.21979 5.78104C5.07906 5.64031 5 5.44944 5 5.25042C5 5.05139 5.07906 4.86052 5.21979 4.71979C5.36052 4.57906 5.55139 4.5 5.75042 4.5C5.94944 4.5 6.14031 4.57906 6.28104 4.71979L12.5004 10.9401L18.7198 4.71979C18.8605 4.57906 19.0514 4.5 19.2504 4.5C19.4494 4.5 19.6403 4.57906 19.781 4.71979C19.9218 4.86052 20.0008 5.05139 20.0008 5.25042C20.0008 5.44944 19.9218 5.64031 19.781 5.78104L13.5607 12.0004L19.781 18.2198Z" fill="black"/>
            </svg>
          </button>
        </motion.div>
      </OutsideClick>
    </div>
  </AnimatePresence>
);