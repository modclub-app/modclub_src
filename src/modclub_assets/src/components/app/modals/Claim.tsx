import * as React from "react";
import { Field } from "react-final-form";
import FormModal from "../modals/FormModal";
import { Principal } from "@dfinity/principal";
import { useState } from "react";
import { UpdateTable } from "../../common/updateTable/UpdateTable";
import { useActors } from "../../../hooks/actors";
import { useAppState, useAppStateDispatch } from "../state_mgmt/context/state";

export default function Claim({ toggle, pendingRewards, userId }) {
  const [amount, setAmount] = useState(pendingRewards);
  const [error, setError] = useState(null);
  const { modclub, vesting } = useActors();
  const appState = useAppState();
  const dispatch = useAppStateDispatch();
  
  const onFormSubmit = async () => {
    try {
      const locked = amount;
      const res = await modclub.claimLockedReward(BigInt(locked), []);
      !appState.lockedBalanceLoading &&
        dispatch({ type: "fetchUserLockedBalance", payload: true });
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
