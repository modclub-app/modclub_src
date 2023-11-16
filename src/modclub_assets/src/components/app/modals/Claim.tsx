import * as React from "react";
import { Field } from "react-final-form";
import { useState } from "react";
import { useActors } from "../../../hooks/actors";
import { useAppState, useAppStateDispatch } from "../state_mgmt/context/state";
import { convert_to_mod } from "../../../utils/util";
import PopupModal from "./PopupModal";

export default function Claim({ toggle, userId, show }) {
  const appState = useAppState();
  const dispatch = useAppStateDispatch();
  const pendingRewards = convert_to_mod(
    appState.lockedBalance,
    appState.decimals
  );
  const [load, setLoader] = useState(false);
  const [claimValue, setClaimValue] = useState(pendingRewards);

  const [warning, setWarning] = useState(null);
  const { modclub, vesting } = useActors();

  const onFormSubmit = async () => {
    setLoader(true);
    try {
      const claimReq: number =
        Number(claimValue) * Math.pow(10, Number(appState.decimals));
      const res = await modclub.claimLockedReward(BigInt(claimReq), []);
      if (Object.keys(res)[0] === "ok") {
        !appState.systemBalanceLoading &&
          dispatch({ type: "systemBalanceLoading", payload: true });
        !appState.lockedBalanceLoading &&
          dispatch({ type: "fetchUserLockedBalance", payload: true });
      }
      return { reserved: claimReq, transfer: res };
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
        loader={load}
      >
        <div className="field">
          <div className="control">
            <Field
              name="amount"
              component="input"
              type="text"
              className={!load ? "input" : "input is-danger"}
              initialValue={claimValue}
              onChange={(e) => {
                setClaimValue(e.target.value);
              }}
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
