import React, { useState } from 'react';
import classNames from 'classnames/bind';

// Styles
import styles from './styles.scss';
const cn = classNames.bind(styles);

// Components
import { Portal } from '../Portal';
import { Modal } from '../Modal';
import { PopupContent } from './PopupContent';

export const InfoAbout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const onHandlerClick = () => setIsOpen(!isOpen);

  console.log('isOpen --> ', isOpen);

  return (
    <React.Fragment>
      <button
        onClick={onHandlerClick}
        className={cn("info-button")}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 6V12M6 2.33782C7.47087 1.48697 9.17856 1 11 1C16.5228 1 21 5.47715 21 11C21 16.5228 16.5228 21 11 21C5.47715 21 1 16.5228 1 11C1 9.17856 1.48697 7.47087 2.33782 6M12 15C12 15.5523 11.5523 16 11 16C10.4477 16 10 15.5523 10 15C10 14.4477 10.4477 14 11 14C11.5523 14 12 14.4477 12 15Z" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>

      {isOpen && (
        <Portal>
          <Modal closeModal={onHandlerClick}>
            <PopupContent />
          </Modal>
        </Portal>
      )}
    </React.Fragment>
  );
}