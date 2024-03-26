import React from "react";
import { useState } from "react";
import PropTypes from "prop-types";

const InfoButton = ({ message, style }) => {
  const [showMessage, setShowMessage] = useState(false);

  const handleMouseEnter = () => {
    setShowMessage(true);
  };

  const handleMouseLeave = () => {
    setShowMessage(false);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ display: "inline-block", cursor: "pointer", ...style }}
    >
      ℹ️
      {showMessage && (
        <div
          style={{
            position: "absolute",
            backgroundColor: "lightgrey",
            color: "black",
            padding: "0.2rem",
            width: "150px",
            top: "1rem",
            right: "1rem",
            zIndex: 9999,
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
};

InfoButton.propTypes = {
  message: PropTypes.string.isRequired,
  style: PropTypes.object,
};

export default InfoButton;
