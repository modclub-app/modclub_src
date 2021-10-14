import React from 'react';
import "./Card.scss";
type Props = {
  children?: React.ReactNode;
  arrowDirection?: string;
  disableOutline?: boolean;
  align?: string;
};

export default function Card(props: Props) {
  let arrowDirection = '';
  switch (props.arrowDirection) {
    case 'left':
      arrowDirection = 'arrow-left'
      break;
    case 'right':
      arrowDirection = 'arrow-right'
      break;
  }
  let align = '';
  switch (props.align) {
    case 'left':
      align = 'columnLeft'
      break;
    case 'right':
      align = 'columnRight'
      break;
  }
  return (
    <div className={'column CardSpacing ' + align  }>
      <div className={'WithBackground Card ' + arrowDirection }>
        {props.children}
      </div>
      {!props.disableOutline && <div className="gradient-line" />}
    </div>
  );
}