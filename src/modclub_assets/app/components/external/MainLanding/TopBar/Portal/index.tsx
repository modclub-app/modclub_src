import React from 'react';
import ReactDOM from 'react-dom';

export const Portal: React.FC<{
  children: React.ReactNode;
  containerId?: string;
}> = ({ 
  children, 
  containerId = 'portal-root' 
}) => {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error(`Container with id "${containerId}" not found.`);
    return null;
  }

  return ReactDOM.createPortal(children, container);
};