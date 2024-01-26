import moment from "moment";
import { useEffect, useState } from "react";
import { GTMManager, GTMEvent, GTMTypes } from "../../../utils/gtm";
import { useAppState } from "../../app/state_mgmt/context/state";

// Timer: countdown in seconds -> detail = false
//        countdown in timestamp -> detail = true
const Timer = ({ countdown, toggle, detail = false, showSecond = false }) => {
  const [counting, setCounting] = useState(countdown);
  const minutes = Math.floor((counting % 3600) / 60);
  const seconds = Math.floor(counting % 60);
  const appState = useAppState();

  const getRemainingTime = () => {
    if (
      !moment(countdown).isValid() ||
      moment(countdown).isBefore(moment.utc())
    ) {
      return "Invalid countdown timestamp";
    }
    const now = moment.utc();
    const endDate = moment.utc(countdown);
    const duration = moment.duration(endDate.diff(now));

    const days = Math.floor(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    return `${days} days ${hours} hours ${minutes} 
    mins ${showSecond ? `${seconds} sec` : ""}`.trim();
  };

  const triggerGTMEvent = () => {
    // GTM: determine the quantity of people who reserved "human verification" tasks
    // but do not finish verification.
    GTMManager.trackEvent(
      GTMEvent.HumanVerificationEventName,
      {
        uId: appState.loginPrincipalId,
        userLevel: Object.keys(appState.rs.level)[0],
        eventType: GTMTypes.HumanVerificationExpiredEventType,
      },
      ["uId"]
    );
  };

  useEffect(() => {
    setCounting(countdown);
  }, [countdown]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCounting((prevCounting) => {
        if (prevCounting > 0) {
          return prevCounting - 1;
        } else {
          clearInterval(timer);
          triggerGTMEvent();
          toggle();
          return prevCounting;
        }
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [counting]);

  return (
    <>
      {!detail ? (
        <span>
          {minutes}:{seconds}
        </span>
      ) : (
        <span>{getRemainingTime()}</span>
      )}
    </>
  );
};

export default Timer;
