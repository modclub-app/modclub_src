import React from "react";
import { Field } from "react-final-form";
import { Icon, Notification } from "react-bulma-components";
import { useContext, useEffect, useState } from "react";
import PopupModal from "./PopupModal";
import { convert_to_mod, format_token } from "../../../utils/util";
import { useActors } from "../../../hooks/actors";
import { Connect2ICContext, useConnect } from "@connect2icmodclub/react";
import { useAppState, useAppStateDispatch } from "../state_mgmt/context/state";
import { GTMEvent, GTMManager, GTMTypes } from "../../../utils/gtm";

interface DepositProps {
  toggle: () => void;
  subacc?: Uint8Array;
}
export default function Deposit({ toggle, subacc, show }: DepositProps) {
  const appState = useAppState();
  const dispatch = useAppStateDispatch();
  const [inputValue, setInputValue] = useState(0);
  const [error, setError] = useState(null);
  const { modclub, wallet } = useActors();
  const { activeProvider, principal } = useConnect();
  const [receiver, setReceiver] = useState(String);
  const [load, setLoader] = useState(false);
  const [warning, setWarning] = useState(null);
  const { client } = useContext(Connect2ICContext);
  const feeTokens = convert_to_mod(
    appState.transactionFee,
    BigInt(appState.decimals)
  );
  const personalBalance = convert_to_mod(
    appState.personalBalance,
    BigInt(appState.decimals)
  );

  useEffect(() => {
    if (client._service && client._service._state.context) {
      const context = client._service._state.context;
      const modclubDef = context.canisters.modclub;
      setReceiver(modclubDef.canisterId);
    }
  }, [client]);

  const handleDeposit = async (value: any) => {
    setError(null);
    setLoader(true);
    const { reserved } = value;
    try {
      const amount: number =
        Number(reserved) * Math.pow(10, Number(appState.decimals));
      dispatch({
        type: "accountDepositAction",
        payload: { amount, subAcc: subacc },
      });

      // GTM: determine amount of "Deposit" users make into
      // their account and how many users made Deposits;
      GTMManager.trackEvent(
        GTMEvent.TransactionEventName,
        {
          uId: appState.loginPrincipalId,
          userLevel: Object.keys(appState.rs.level)[0],
          amount,
          eventType: GTMTypes.TransactionDepositEventType,
        },
        ["uId"]
      );
    } catch (err) {
      setError(err.message);
    }
    setLoader(false);
  };

  const depositManual = (principal, activeProvider) => {
    return (
      <>
        {activeProvider.meta.id === "ii" && (
          <>
            <h1 className="is-capitalized has-text-weight-bold is-size-6">
              Step 1:
            </h1>
            <h2>Manually deposit into your account:</h2>
            <p className="is-flex is-justify-content-center has-text-dark-green grey-text-background text-emphasis">
              {principal}
              <Icon
                className="ml-3 is-clickable icon-dark-green"
                onClick={() => {
                  navigator.clipboard.writeText(principal);
                }}
              >
                <span className="material-icons">file_copy</span>
              </Icon>
            </p>
            <br />
          </>
        )}
        {activeProvider.meta.id === "ii" && (
          <>
            <p>
              Your current account balance:{" "}
              <b> {format_token(personalBalance)} MOD </b>
            </p>
            <p className="is-size-7">
              {
                "*only applicable to users that are logged in with internet identity."
              }
            </p>
            <br />
            <h1 className="is-capitalized has-text-weight-bold is-size-6">
              Step 2:
            </h1>
          </>
        )}
        {activeProvider.meta.id === "stoic" && (
          <>
            <br />
            <p>
              Your current Stoic Wallet balance:{" "}
              <b> {format_token(personalBalance)} MOD </b>
            </p>
          </>
        )}
      </>
    );
  };
  return (
    <>
      {error != null && (
        <Notification color={"danger"} className="has-text-centered">
          {error}
        </Notification>
      )}
      <PopupModal
        toggle={toggle}
        show={show}
        title="Deposit"
        subtitle="Congratulation!"
        loader={!!appState.accountDepositAction}
        handleSubmit={handleDeposit}
        trackEventId={GTMTypes.TransactionDepositEventType}
      >
        {principal &&
          activeProvider.meta.id != "plug" &&
          depositManual(principal, activeProvider)}
        <h2>Add to your Modclub active balance: </h2>
        <br />
        <div className="field">
          <div className="control">
            <div className="is-flex is-align-items-center">
              <Field
                name="reserved"
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
                  // if (Number(value) > personalBalance - feeTokens) {
                  //   setWarning("Out of balance");
                  //   return setLoader(true);
                  // }
                  else {
                    setWarning(null);
                    setLoader(false);
                  }
                }}
              />
              <div
                className="mr-5 justify-content-center icon-dark-green"
                style={{ marginLeft: "1.5rem", fontSize: '1.25rem' }}
              >
                MOD
              </div>
            </div>
          </div>
        </div>
        {warning && (
          <p className="mr-5 justify-content-center has-text-danger">
            {warning}
          </p>
        )}
        <br />
      </PopupModal>
    </>
  );
}
