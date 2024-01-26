import * as React from "react";
import { useState } from "react";
import { Field } from "react-final-form";
import { Icon, Level } from "react-bulma-components";
import PopupModal from "./PopupModal";
import { useActors } from "../../../hooks/actors";
import { useAppState, useAppStateDispatch } from "../state_mgmt/context/state";
import { GTMEvent, GTMManager } from "../../../utils/gtm";

const UpdateTable = ({ activeBalance, stake, amount = 0 }) => {
  return (
    <>
      <Level className="has-text-silver px-5">
        <span>Available:</span>
        <span className="has-text-weight-bold">{activeBalance}</span>
      </Level>
      <Level className="has-text-silver px-5">
        <span>Available after:</span>
        <span className="has-text-weight-bold">{activeBalance - amount}</span>
      </Level>
      <Level className="has-text-silver px-5">
        <span>Current Stake:</span>
        <span className="has-text-weight-bold">{stake}</span>
      </Level>
      <Level className="has-text-silver px-5">
        <span>After Stake:</span>
        <span className="has-text-weight-bold">{stake + Number(amount)}</span>
      </Level>
    </>
  );
};

export default function Stake({ toggle, wallet, stake, onUpdate, show }) {
  const { modclub } = useActors();
  const appState = useAppState();
  const dispatch = useAppStateDispatch();
  const [inputValue, setInputValue] = useState(0);
  const [load, setLoader] = useState(false);
  const [warning, setWarning] = useState(null);

  const onFormSubmit = async (values: any) => {
    const { amount } = values;
    try {
      if (amount < wallet) {
        dispatch({ type: "stakeTokensAction", payload: { amount } });
      }

      // GTM: determine amount of "Stake" users make into
      // their account and how many users made Stake;
      GTMManager.trackEvent(
        GTMEvent.TransactionEventName,
        {
          uId: appState.loginPrincipalId,
          userLevel: Object.keys(appState.rs.level)[0],
          amount,
          type: GTMEvent.TransactionStakeEventType,
        },
        ["uId"]
      );
    } catch (error) {
      console.error("Stake Failed:", error);
    }
  };

  return (
    <PopupModal
      title="Stake"
      show={show}
      subtitle="Congratulation!"
      toggle={toggle}
      loader={!!appState.stakeTokensAction}
      handleSubmit={onFormSubmit}
      updateTable={<UpdateTable activeBalance={wallet} stake={stake} />}
      trackEventId={GTMEvent.TransactionStakeEventType}
    >
      <br />
      <div className="field">
        <div className="control has-icons-right">
          <Field
            name="amount"
            component="input"
            type="number"
            className={!load ? "input" : "input is-danger"}
            initialValue={inputValue}
            validate={(value) => {
              if (isNaN(value) || Number(value) < 0) {
                setWarning("Incorrect amount");
                return setLoader(true);
              }
              if (isNaN(value) || Number(value) == 0) {
                setWarning(null);
                return setLoader(true);
              }
              if (Number(value) > wallet) {
                setWarning("Out of balance");
                return setLoader(true);
              } else {
                setWarning(null);
                setLoader(false);
              }
            }}
          />
          <Icon align="right" color="white" className="mr-4">
            MOD
          </Icon>
        </div>
      </div>
      {warning && (
        <p className="mr-5 justify-content-center has-text-danger">{warning}</p>
      )}
      <br />
    </PopupModal>
  );
}
