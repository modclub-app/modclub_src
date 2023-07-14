import * as React from "react";
import { Field } from "react-final-form";
import { Level, Icon } from "react-bulma-components";
import FormModal from "../modals/FormModal";
import { claimLockedReward } from "../../../utils/api";
import { useState } from "react";

const UpdateTable = ({ claim }) => {
  return (
    <>
      <Level className="has-text-silver px-5">
        <span>Available:</span>
        <span className="has-text-weight-bold">{claim}</span>
      </Level>
    </>
  );
};

export default function Claim({ toggle, tokenHoldings }) {
  const [amount, setAmount] = useState(tokenHoldings.pendingRewards);
  const [error, setError] = useState(null);

  const onFormSubmit = async (values: any) => {
    const { amount } = values;
    try {
      return await claimLockedReward(amount);
    } catch (err) {
      setError(err.message);
    }
  };

  //TODO
  const preventMax = (e) => {
    let inputValue = parseInt(e.target.value);
    if (inputValue > tokenHoldings.pendingRewards) {
      setAmount(tokenHoldings.pendingRewards);
    } else {
      setAmount(inputValue);
    }
  };

  return (
    <FormModal
      title="Claim"
      toggle={toggle}
      handleSubmit={onFormSubmit}
      updateTable={<UpdateTable claim={amount} />}
    >
      {error && <div className="error">{error}</div>}
      <div className="field">
        <div className="control">
           <Field
             name="amount"
             component="input"
             type="hidden"
             className="input"
             initialValue={tokenHoldings.pendingRewards}
           />
        </div>
      </div>
    </FormModal>
  );
}
