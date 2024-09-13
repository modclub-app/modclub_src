import React from 'react';

export const PageMainStyles = () => (
  <span 
    dangerouslySetInnerHTML={{ 
      __html: `
      <style>
        html, body, #app {
          background-color: #000;
          color: #fff;
        }
      </style>`
    }} 
  />
);