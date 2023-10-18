import { Field } from "react-final-form";
import { Icon, Notification } from "react-bulma-components";
import { useEffect, useState } from "react";
import { icrc1Transfer } from "../../../utils/api";
import { Principal } from "@dfinity/principal";
import PopupModal from "./PopupModal";
import { convert_to_mod, format_token } from "../../../utils/util";
import { useActors } from "../../../hooks/actors";
import { useConnect, useProviders } from "@connect2icmodclub/react";
import { useAppState, useAppStateDispatch } from "../state_mgmt/context/state";

import { useContext } from "react";
import { Connect2ICContext } from "@connect2icmodclub/react";

interface DepositProps {
  toggle: () => void;
  provider?: string;
  subacc?: Uint8Array;
  isProvider: boolean;
}
export default function Deposit({
  toggle,
  provider,
  isProvider,
  subacc,
}: DepositProps) {
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
      const transfer = await icrc1Transfer(
        wallet,
        activeProvider.meta.id,
        BigInt(amount),
        Principal.fromText(receiver),
        subacc
      );
      !appState.systemBalanceLoading &&
        dispatch({ type: "systemBalanceLoading", payload: true });
      !appState.personalBalanceLoading &&
        dispatch({ type: "personalBalanceLoading", payload: true });
      return { reserved: Number(reserved), transfer: transfer };
    } catch (err) {
      setError(err.message);
    }
    setLoader(false);
  };

  const handleDepositProvider = async (value: any) => {
    setError(null);
    setLoader(true);
    const { reserved } = value;
    try {
      const amount: number =
        Number(reserved) * Math.pow(10, Number(appState.decimals));
      let subacc = await modclub.getProviderSa("RESERVE", [
        Principal.fromText(provider),
      ]);
      if (subacc.length == 0) {
        subacc = [];
      }
      const transfer = await icrc1Transfer(
        wallet,
        activeProvider.meta.id,
        BigInt(amount),
        Principal.fromText(receiver),
        subacc
      );
      !appState.personalBalanceLoading &&
        dispatch({ type: "personalBalanceLoading", payload: true });
      !appState.providerBalanceLoading &&
        dispatch({ type: "providerBalanceLoading", payload: true });
      return { reserved: Number(reserved), transfer: transfer };
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
            <p className="is-flex is-justify-content-center has-text-white has-background-grey-darker">
              {principal}
              <Icon
                color="white"
                className="ml-3 is-clickable"
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
        ) }{ activeProvider.meta.id === "stoic" &&
          (
          <>
          <br/>
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
        title="Deposit"
        subtitle="Congratulation!"
        loader={load}
        handleSubmit={isProvider ? handleDepositProvider : handleDeposit}
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
              <Icon
                align="right"
                color="white"
                className="mr-5 justify-content-center"
                style={{ marginLeft: "1.5rem" }}
              >
                MOD
              </Icon>
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
