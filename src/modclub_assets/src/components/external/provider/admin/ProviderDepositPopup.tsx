import { Field } from "react-final-form";
import { Icon, Notification } from "react-bulma-components";
import { useEffect, useState } from "react";
import { Principal } from "@dfinity/principal";
import PopupModal from "../../../app/modals/PopupModal";
import { convert_to_mod, format_token } from "../../../../utils/util";
import { useActors } from "../../../../hooks/actors";
import { useConnect, useProviders } from "@connect2icmodclub/react";
import {
  useAppState,
  useAppStateDispatch,
} from "../../../app/state_mgmt/context/state";

import { useContext } from "react";
import { Connect2ICContext } from "@connect2icmodclub/react";

interface DepositProps {
  toggle: () => void;
  show: boolean;
}
export default function ProviderDepositPopup({ toggle, show }: DepositProps) {
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

  const handleDepositProvider = async (value: any) => {
    setError(null);
    setLoader(true);
    const { amountMOD } = value;
    try {
      const amount: number =
        Number(amountMOD) * Math.pow(10, Number(appState.decimals));
      let subacc = await modclub.getProviderSa("RESERVE", [
        appState.selectedProvider.id,
      ]);
      subacc.length == 0 && (subacc = []);

      dispatch({
        type: "accountDepositAction",
        payload: { amount, subAcc: subacc },
      });
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
            <h2>Manually deposit into your provider account:</h2>
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
              Your current account balance: <b> {personalBalance} MOD </b>
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
              Your current Stoic Wallet balance: <b> {personalBalance} MOD </b>
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
        title="Deposit provider"
        subtitle="Congratulation!"
        loader={!!appState.accountDepositAction}
        handleSubmit={handleDepositProvider}
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
                name="amountMOD"
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
