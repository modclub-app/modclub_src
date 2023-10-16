import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

const Timer = ({ countdown, toggle }) => {
  const [counting, setCounting] = useState(Math.floor(countdown));
  const minutes = Math.floor(counting / 60);
  const seconds = Math.floor(counting % 60);
  useEffect(() => {
    const timer = setInterval(() => {
      setCounting(counting > 0 && counting - 1);
    }, 1000);

    if (counting === 0) {
        clearInterval(timer);
        toggle()
    }

    return () => {
      clearInterval(timer);
    };
  },[counting]);

  return (
    <>
      <span>
        {minutes}:{seconds}
      </span>
    </>
  );
};

export default Timer;
