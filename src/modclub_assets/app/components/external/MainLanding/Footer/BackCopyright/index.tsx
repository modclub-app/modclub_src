import React from 'react';
import classNames from 'classnames/bind';

// Styles
import styles from './styles.scss';
const cn = classNames.bind(styles);

export const BackCopyright = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className={cn("copyright")}>
      <button
        className={cn("back-to-top-button")}
        onClick={scrollToTop}
      >
        Back to top
        <span className={cn("back-to-top-arrow")}>
          <svg width="11" height="13" viewBox="0 0 11 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 0L11 5.41605L10.2819 6.12316L6.00775 1.91421L6.00775 13H4.99225L4.99225 1.91421L0.718067 6.12316L0 5.41605L5.5 0Z" fill="#030303"/>
          </svg>
        </span>
      </button>

      <div className={cn("copyright-text")}>
        ©2024 DecideAI
      </div>
    </div>
  );
};
