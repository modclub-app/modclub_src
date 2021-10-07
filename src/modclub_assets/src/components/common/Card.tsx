import React from 'react';
import "./Card.scss";
type Props = {
  children?: React.ReactNode;
};

export default function Card(props: Props) {
  return (
    <div className="column CardSpacing" >
      <div className="Card">
        {props.children}
      </div>
      <div className="gradient-line"/>
    </div>
  );
}