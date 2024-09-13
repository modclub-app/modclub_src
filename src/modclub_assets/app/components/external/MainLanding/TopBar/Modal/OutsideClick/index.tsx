import React, { useRef, useEffect } from "react";

export const OutsideClick: React.FC<{
    onClick: () => void;
    children: React.ReactElement;
}> = ({
  onClick,
  children,
}) => {
  const elemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (elemRef.current && !elemRef.current.contains(event.target as Node)) {
        onClick();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClick]);

  return React.cloneElement(children, { ref: elemRef });
};