import * as React from "react";
import { Field } from "react-final-form";
import FormModal from "../modals/FormModal";
import { Principal } from "@dfinity/principal";
import { useState } from "react";
import { UpdateTable } from "../../common/updateTable/UpdateTable";
import { useActors } from "../../../hooks/actors";

export default function Claim({ toggle, pendingRewards, userId }) {
  const [amount, setAmount] = useState(pendingRewards);
  const [error, setError] = useState(null);
  const { modclub, vesting } = useActors();
  const onFormSubmit = async () => {
    try {
      const locked = await vesting.locked_for({
        owner: Principal.fromText(userId),
        subaccount: [],
      });
      const res = await modclub.claimLockedReward(BigInt(locked), []);
      return res.ok;
    } catch (err) {
      setError(err.message);
    }
  };

  const preventMax = (e) => {
    let inputValue = parseInt(e.target.value);
    if (inputValue > pendingRewards) {
      setAmount(pendingRewards);
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
            initialValue={pendingRewards}
            onInput={preventMax}
          />
        </div>
      </div>
    </FormModal>
  );
}
