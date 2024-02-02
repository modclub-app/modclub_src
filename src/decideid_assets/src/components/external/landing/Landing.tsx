import * as React from "react";
import "./Landing.scss";
import { useHistory } from "react-router-dom";
import { GTMEvent, GTMManager } from "../../../utils/gtm";

export default function Landing() {
  const history = useHistory();

  const handlerOnClick = (event) => {
    event.preventDefault();
    // GTM: determine the number of users who attempt to launch the app;
    // GTMManager.trackEvent(GTMEvent.LaunchApp, {});
    history.push("/app");
  };

  return (
    <>
      <div>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
          onClick={handlerOnClick}
        >
          Launch App
        </button>
      </div>
    </>
  );
}
