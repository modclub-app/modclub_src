import { Level } from "react-bulma-components";

export const UpdateTable = ({ amount, text }) => {
    return (
      <>
        <Level className="has-text-silver px-5">
          <span>{text}</span>
          <span className="has-text-weight-bold">{amount}</span>
        </Level>
      </>
    );
  };