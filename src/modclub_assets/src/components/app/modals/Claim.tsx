import * as React from "react";
import { Field } from "react-final-form";
import FormModal from "../modals/FormModal";
import { claimLockedReward, lockedFor } from "../../../utils/api";
import { useState } from "react";
import { UpdateTable } from "../../common/updateTable/UpdateTable";

export default function Claim({ toggle, tokenHoldings, userId }) {
  const [amount, setAmount] = useState(tokenHoldings.pendingRewards);
  const [error, setError] = useState(null);

  const onFormSubmit = async () => {
    try {
      const locked = await lockedFor(userId);
      const res = await claimLockedReward(Number(locked));
      return res.ok
    } catch (err) {
      setError(err.message);
    }
  };

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
      updateTable={<UpdateTable amount={amount} text={"Available:"} />}
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
             onInput={preventMax}
           />
        </div>
      </div>
    </FormModal>
  );
}
