import * as React from "react";
import { useState } from "react";
import { Field } from "react-final-form";
import { useAppState, useAppStateDispatch } from "../state_mgmt/context/state";
import { convert_to_mod } from "../../../utils/util";
import PopupModal from "./PopupModal";
import { GTMEvent, GTMManager } from "../../../utils/gtm";

export default function Claim({ toggle, userId, show }) {
  const appState = useAppState();
  const dispatch = useAppStateDispatch();
  const pendingRewards = convert_to_mod(
    appState.lockedBalance,
    appState.decimals
  );
  const [load, setLoader] = useState(false);

  const [warning, setWarning] = useState(null);

  const onFormSubmit = async (values: any) => {
    try {
      const { amount } = values;
      dispatch({ type: "claimRewardsAction", payload: { amount } });

      // GTM: determine amount of Claim users make into
      // their account and how many users made Claim;
      GTMManager.trackEvent(
        GTMEvent.AccountTransaction,
        {
          uId: appState.loginPrincipalId,
          userLevel: Object.keys(appState.rs.level)[0],
          type: "claim",
          amount,
        },
        ["uId"]
      );
    } catch (err) {
      console.error("claimLockedReward::ERROR::", err.message);
    }
  };

  return (
    <>
      <PopupModal
        title="Claim"
        show={show}
        subtitle={"Congratulation"}
        toggle={toggle}
        handleSubmit={onFormSubmit}
        loader={!!appState.claimRewardsAction}
      >
        <div className="field">
          <div className="control">
            <Field
              name="amount"
              component="input"
              type="text"
              className={!load ? "input" : "input is-danger"}
              initialValue={pendingRewards}
              validate={(value) => {
                if (isNaN(value) || Number(value) < 0) {
                  setWarning("Incorrect amount");
                  return setLoader(true);
                }
                if (isNaN(value) || Number(value) == 0) {
                  setWarning(null);
                  return setLoader(true);
                } else {
                  setWarning(null);
                  setLoader(false);
                }
              }}
            />
          </div>
        </div>
        {warning && (
          <p className="mr-5 justify-content-center has-text-danger">
            {warning}
          </p>
        )}
      </PopupModal>
    </>
  );
}
