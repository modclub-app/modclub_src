import * as React from "react";
import { Field } from "react-final-form";
import { Level, Icon } from "react-bulma-components";
import FormModal from "../modals/FormModal";
import { withdrawModeratorReward } from "../../../utils/api";
import { convert_to_mod } from "../../../utils/util";
import { useActors } from "../../../hooks/actors";

import { Principal } from "@dfinity/principal";
import { useState } from "react";
import PopupModal from "./PopupModal";
import { useAppState, useAppStateDispatch } from "../state_mgmt/context/state";

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

export default function Withdraw({ toggle, userTokenBalance, subacc, to }) {
  const appState = useAppState();
  const [inputValue, setInputValue] = useState(0);
  const dispatch = useAppStateDispatch();
  const { wallet, modclub } = useActors();
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
    try {
      const amountTokens: number =
        Number(amount) * Math.pow(10, Number(appState.decimals));
      const transfer = await withdrawModeratorReward(
        modclub,
        BigInt(amountTokens),
        address
      );
      !appState.personalBalanceLoading &&
        dispatch({ type: "personalBalanceLoading", payload: true });
      !appState.systemBalanceLoading &&
        dispatch({ type: "systemBalanceLoading", payload: true });
      return { reserved: Number(amount), transfer: transfer };
    } catch (err) {
      console.error("Withdraw Failed:", err);
    }
  };

  const preventMax = (e) => {
    const newValue = parseInt(e.target.value);
    if (newValue > systemBalance - feeTokens) {
      setInputValue(systemBalance - feeTokens);
      e.target.value = systemBalance - feeTokens;
    } else {
      setInputValue(newValue);
    }
  };

  return (
    <PopupModal
      toggle={toggle}
      title="Withdraw"
      handleSubmit={onFormSubmit}
      subtitle="Congratulation!"
      updateTable={<UpdateTable amount={inputValue || 0} />}
    >
      <label className="label">Enter your wallet address: </label>
      <div className="field">
        <div className="control">
          <Field
            name="address"
            component="input"
            type="text"
            className="input"
            placeholder="Wallet Address"
            initialValue={to}
          />
        </div>
      </div>

      <label className="label">Enter your withdraw amount:</label>
      <div className="field">
        <div className="control has-icons-right">
          <Field
            name="amount"
            component="input"
            type="number"
            className="input"
            initialValue={inputValue}
            onInput={preventMax}
            validate={(value) => {
              if (isNaN(value) || Number(value) <= 0) {
                return "Please enter a positive number";
              }
              if (Number(value) > systemBalance - feeTokens) {
                return "Insufficient balance";
              }
            }}
          />
          <Icon align="right" color="white" className="mr-4">
            MOD
          </Icon>
        </div>
      </div>
    </PopupModal>
  );
}
