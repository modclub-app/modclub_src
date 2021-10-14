import React from 'react';
import "./Card.scss";
type Props = {
  children?: React.ReactNode;
};

export default function GradientCard(props: Props) {
  return (
    <div className="column CardSpacing" >
      <div className="Card border-gradient border-gradient-purple">
        {props.children}
      </div>  
    </div>
  );
}