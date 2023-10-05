import { Field } from "react-final-form";
import { Icon, Notification } from "react-bulma-components";
import { useEffect, useState } from "react";
import { icrc1Transfer } from "../../../utils/api";
import { Principal } from "@dfinity/principal";
import PopupModal from "./PopupModal";
import { format_token } from "../../../utils/util";
import { useActors } from "../../../hooks/actors";
import { useConnect, useProviders } from "@connect2icmodclub/react";
import { useAppState, useAppStateDispatch } from "../state_mgmt/context/state";

import { useContext } from "react";
import { Connect2ICContext } from "@connect2icmodclub/react";

interface DepositProps {
  toggle: () => void;
  userTokenBalance: number;
  receiver: string;
  provider?: string;
  subacc?: Uint8Array;
  isProvider: boolean;
}
export default function Deposit({
  toggle,
  userTokenBalance,
  provider,
  isProvider,
  subacc,
}: DepositProps) {
  const appState = useAppState();
  const dispatch = useAppStateDispatch();
  const [error, setError] = useState(null);
  const [inputValue, setInputValue] = useState(userTokenBalance);
  const { modclub, wallet } = useActors();
  const { activeProvider, principal } = useConnect();
  const [receiver, setReceiver] = useState(String);
  const { client } = useContext(Connect2ICContext);

  useEffect(() => {
    if (client._service && client._service._state.context) {
      const context = client._service._state.context;
      const modclubDef = context.canisters.modclub;
      setReceiver(modclubDef.canisterId);
    }
  }, [client]);

  const handleDeposit = async (value: any) => {
    setError(null);
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
  };

  const handleDepositProvider = async (value: any) => {
    setError(null);
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
      return { reserved: Number(reserved), transfer: transfer };
    } catch (err) {
      setError(err.message);
    }
  };

  const preventMax = (e) => {
    const newValue = parseInt(e.target.value);
    if (newValue > userTokenBalance) {
      setInputValue(userTokenBalance);
      e.target.value = userTokenBalance;
    } else {
      setInputValue(newValue);
    }
  };
  const depositManual = (principal, userTokenBalance) =>{
    return (
    <>
    <h1 className="is-capitalized has-text-weight-bold is-size-6">Step 1:</h1>
    <label className="label is-size-6">Manually deposit into your account:</label>
    <p className="is-flex is-justify-content-center has-text-white">
      {principal}
      <Icon
        color="white"
        className="ml-3 is-clickable"
        onClick={() => {navigator.clipboard.writeText(principal);}}
      >
        <span className="material-icons">file_copy</span>
      </Icon>
    </p>
    <br/>
    <p>Your current account balance: {format_token(userTokenBalance)} MOD</p>
    <div className="has-text-weight-light is-italic ">{"*only applicable to users that are logged in with internet identity."}</div>
    <br/>
    <h1 className="is-capitalized has-text-weight-bold is-size-6">Step 2:</h1>
    </>
    )
  }
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
        handleSubmit={isProvider ? handleDepositProvider : handleDeposit}
      >
        {principal && activeProvider.meta.id != "plug"  && depositManual(principal, userTokenBalance)}
        <label className="label is-size-6">Add to your Modclub active balance: </label>
        <br />
        <div className="field">
          <div className="control">
            <div className="is-flex is-align-items-center">
              <Field
                name="reserved"
                component="input"
                type="number"
                className="input"
                initialValue={0}
                onInput={preventMax}
              />
              <Icon
                align="right"
                color="white"
                className="mr-4 justify-content-center"
                style={{ marginLeft: "1.5rem" }}
              >
                MOD
              </Icon>
            </div>
          </div>
        </div>    
      </PopupModal>
    </>
  );
}
