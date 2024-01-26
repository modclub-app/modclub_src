import * as React from "react";
import "./Landing.scss";
import { useHistory } from "react-router-dom";
import { GTMEvent, GTMManager } from "../../../utils/gtm";

export default function Landing() {
  const history = useHistory();

  const handlerOnClick = (event) => {
    event.preventDefault();
    // GTM: determine the number of users who attempt to launch the app;
    GTMManager.trackEvent(GTMEvent.LaunchApp, {});
    history.push("/app");
  };

  return (
    <>
      <div>
        <a
          className="button is-large extra is-primary mt-6"
          onClick={handlerOnClick}
        >
          Launch App
        </a>
      </div>
    </>
  );
}
