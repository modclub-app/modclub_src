import { Field } from "react-final-form";
import { Level, Icon } from "react-bulma-components";
import FormModal from "../modals/FormModal";
import { useState } from "react";

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
  )
}

export default function Withdraw({ toggle, tokenHoldings }) {  
  const onFormSubmit = async (values: any) => {
    console.log("onFormSubmit", values);
    const { amount } = values;
    // return await unStakeTokens(amount);
  };

  const preventMax = (e) => {
    if (parseInt(e.target.value) > tokenHoldings.wallet) {
      e.target.value = tokenHoldings.wallet; 
    }
  }

  return (
    <FormModal
      title="Withdraw"
      toggle={toggle}
      handleSubmit={onFormSubmit}
      updateTable={<UpdateTable wallet={tokenHoldings.wallet} />}
    >
      <div className="field">
        <div className="control">
          <Field
            name="address"
            component="input"
            type="text"
            className="input"
            placeholder="Wallet Address"
          />
        </div>
      </div>
      <div className="field">
        <div className="control has-icons-right">
          <Field
            name="amount"
            component="input"
            type="number"
            className="input"
            initialValue={100}
            onInput={preventMax}
          />
          <Icon align="right" color="white" className="mr-4">
            AMT
          </Icon>
        </div>
      </div>
    </FormModal>
  );
};