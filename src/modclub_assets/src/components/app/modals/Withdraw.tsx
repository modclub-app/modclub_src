import * as React from "react";
import { Field } from "react-final-form";
import { Level, Icon } from "react-bulma-components";
import { useActors } from "../../../hooks/actors";

import { useState } from "react";
import PopupModal from "./PopupModal";
import { useAppState, useAppStateDispatch } from "../state_mgmt/context/state";
import { convert_to_mod } from "../../../utils/util";
import GTMManager from "../../../utils/gtm";

const UpdateTable = ({ amount }) => {
  const appState = useAppState();
  const feeTokens = convert_to_mod(
    appState.transactionFee,
    BigInt(appState.decimals)
  );
  const systemBalance = convert_to_mod(
    appState.systemBalance,
    BigInt(appState.decimals)
  );
  const availableAfter = parseFloat(systemBalance - amount - feeTokens).toFixed(
    4
  );
  return (
    <>
      <Level className="has-text-silver px-5">
        <span>Available:</span>
        <span className="has-text-weight-bold">{systemBalance}</span>
      </Level>
      <Level className="has-text-silver px-5">
        <span>Transaction fee:</span>
        <span className="has-text-weight-bold">{feeTokens}</span>
      </Level>
      <Level className="has-text-silver px-5">
        <span>Available after:</span>
        <span className="has-text-weight-bold">{availableAfter}</span>
      </Level>
    </>
  );
};

export default function Withdraw({
  toggle,
  userTokenBalance,
  subacc,
  to,
  show,
}) {
  const appState = useAppState();
  const [inputValue, setInputValue] = useState(0);
  const dispatch = useAppStateDispatch();
  const { wallet, modclub } = useActors();
  const [load, setLoader] = useState(false);
  const [warning, setWarning] = useState(null);
  const [address, setAddress] = useState(null);
  const [amount, setAmount] = useState(null);
  const feeTokens = convert_to_mod(
    appState.transactionFee,
    BigInt(appState.decimals)
  );
  const systemBalance = convert_to_mod(
    appState.systemBalance,
    BigInt(appState.decimals)
  );
  const onFormSubmit = async (values: any) => {
    const { amount, address } = values;
    dispatch({
      type: "accountWithdrawAction",
      payload: { amount, target: address },
    });

    // GTM: determine amount of Withdraw users make into
    // their account and how many users made Withdraw;
    GTMManager.trackEvent(
      "accountTransaction",
      {
        uId: appState.loginPrincipalId,
        userLevel: Object.keys(appState.rs.level)[0],
        type: "withdraw",
        amount,
      },
      ["uId"]
    );
  };

  return (
    <PopupModal
      toggle={toggle}
      show={show}
      title="Withdraw"
      handleSubmit={onFormSubmit}
      subtitle="Congratulation!"
      loader={!!appState.accountWithdrawAction}
      updateTable={<UpdateTable amount={inputValue || 0} />}
      isSubmitDisabled={!(address && amount)}
    >
      <label className="label">Enter your wallet address: </label>
      <div className="field">
        <div className="control">
          <Field
            name="address"
            component="input"
            type="text"
            required
            className="input"
            placeholder="Wallet Address"
            validate={(value) => {
              if (value) {
                return setAddress(value);
              }
            }}
          />
        </div>
        <label className="label">Enter your withdraw amount:</label>
        <br />
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
                setAmount(null);
                return setLoader(false);
              }
              if (isNaN(value) || Number(value) == 0) {
                setWarning(null);
                setAmount(null);
                return setLoader(false);
              }
              if (Number(value) > systemBalance - feeTokens) {
                setWarning("Out of balance");
                setAmount(null);
                return setLoader(false);
              } else {
                setWarning(null);
                return setAmount(value);
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
