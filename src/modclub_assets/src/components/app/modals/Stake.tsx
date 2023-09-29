import * as React from "react";
import { Field } from "react-final-form";
import { Level, Icon } from "react-bulma-components";
import PopupModal from "./PopupModal";
import { useState } from "react";
import { useActors } from "../../../hooks/actors";
import { useAppState, useAppStateDispatch } from "../state_mgmt/context/state";

const UpdateTable = ({ wallet, stake, amount = 0 }) => {
  return (
    <>
      <Level className="has-text-silver px-5">
        <span>Available:</span>
        <span className="has-text-weight-bold">{wallet}</span>
      </Level>
      <Level className="has-text-silver px-5">
        <span>Available after:</span>
        <span className="has-text-weight-bold">{wallet - amount}</span>
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

export default function Stake({ toggle, wallet, stake, onUpdate }) {
  const { modclub } = useActors();
  const appState = useAppState();
  const dispatch = useAppStateDispatch();
  const onFormSubmit = async (values: any) => {
    const { amount } = values;
    try {
      if(amount < wallet){
        const amounts: number =
          Number(amount) * Math.pow(10, Number(appState.decimals));
        const res = await modclub.stakeTokens(BigInt(amounts));
        !appState.systemBalanceLoading &&
          dispatch({ type: "systemBalanceLoading", payload: true });
        !appState.personalBalanceLoading &&
          dispatch({ type: "personalBalanceLoading", payload: true });
        !appState.stakeBalanceLoading &&
          dispatch({ type: "stakeBalanceLoading", payload: true });
      return { reserved: Number(amount), transfer: res };}
    } catch (error) {
      console.error("Stake Failed:", error);
    }
  };

  return (
    <PopupModal
      title="Stake"
      subtitle="Congratulation!"
      toggle={toggle}
      handleSubmit={onFormSubmit}
      updateTable={
        <UpdateTable
          wallet={wallet}
          stake={stake}
        />
      }
    >
      <div className="field">
        <div className="control has-icons-right">
          <Field
            name="amount"
            component="input"
            type="number"
            className="input"
            initialValue="0"
          />
          <Icon align="right" color="white" className="mr-4">
            AMT
          </Icon>
        </div>
      </div>
    </PopupModal>
  );
}
