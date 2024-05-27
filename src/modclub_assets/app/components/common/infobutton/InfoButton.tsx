import React from "react";
import { useState } from "react";
import PropTypes from "prop-types";
import infoIconImage from "../../../../assets/info_icon_new.svg";

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
      className="info-icon-button"
      style={{ ...style }}
    >
      <img src={infoIconImage} />
      {showMessage && (
        <div className="info-bubble-modal">
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
