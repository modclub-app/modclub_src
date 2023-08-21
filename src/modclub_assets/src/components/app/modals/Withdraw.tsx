import * as React from "react";
import { Field } from "react-final-form";
import { Level, Icon } from "react-bulma-components";
import FormModal from "../modals/FormModal";
import { withdrawModeratorReward } from "../../../utils/api";
import { useActors } from "../../../hooks/actors";

import { Principal } from "@dfinity/principal";
import { useState } from "react";
import PopupModal from "./PopupModal";

const UpdateTable = ({ wallet, amount = 0 }) => {
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
    </>
  );
};

export default function Withdraw({ toggle, userTokenBalance, subacc, to }) {
  const [inputValue, setInputValue] = useState(userTokenBalance);
  const { wallet, modclub } = useActors();
  const onFormSubmit = async (values: any) => {
    const { amount, address } = values;
    try {
      const digit = await wallet.icrc1_decimals();
      const amounts: number = Number(amount) * Math.pow(10, Number(digit));
      const transfer = await withdrawModeratorReward(
        modclub,
        BigInt(amounts),
        address
      );
      return { reserved: Number(amount), transfer: transfer };
    } catch (err) {
      console.error("Withdraw Failed:", err);
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

  return (
    <PopupModal
      toggle={toggle}
      title="Withdraw"
      handleSubmit={onFormSubmit}
      subtitle="Congratulation!"
      updateTable={<UpdateTable wallet={userTokenBalance} />}
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
            initialValue={userTokenBalance}
            onInput={preventMax}
            validate={(value) => {
              if (isNaN(value) || Number(value) <= 0) {
                return "Please enter a positive number";
              }
              if (Number(value) > userTokenBalance) {
                return "Insufficient balance";
              }
            }}
          />
          <Icon align="right" color="white" className="mr-4">
            AMT
          </Icon>
        </div>
      </div>
    </PopupModal>
  );
}
