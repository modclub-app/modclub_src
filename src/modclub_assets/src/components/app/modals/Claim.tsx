import * as React from "react";
import { Field } from "react-final-form";
import FormModal from "../modals/FormModal";
import { useEffect, useState } from "react";
import { UpdateTable } from "../../common/updateTable/UpdateTable";
import { useActors } from "../../../hooks/actors";
import { useAppState, useAppStateDispatch } from "../state_mgmt/context/state";

export default function Claim({ toggle, pendingRewards, userId }) {
  const [amount, setAmount] = useState(pendingRewards);
  const [error, setError] = useState(null);
  const [inputValue, setInputValue] = useState(0);
  const [load, setLoader] = useState(false);
  const [warning, setWarning] = useState(null);
  const { modclub, vesting } = useActors();
  const appState = useAppState();
  const dispatch = useAppStateDispatch();

  const onFormSubmit = async () => {
    setLoader(true);
    try {
      const locked = amount;
      const res = await modclub.claimLockedReward(BigInt(locked), []);
      !appState.personalBalanceLoading &&
        dispatch({ type: "personalBalanceLoading", payload: true });
      !appState.systemBalanceLoading &&
        dispatch({ type: "systemBalanceLoading", payload: true });
      !appState.lockedBalanceLoading &&
        dispatch({ type: "fetchUserLockedBalance", payload: true });
      return res.ok;
    } catch (err) {
      setError(err.message);
    }
    setLoader(false);
  };
  useEffect(() => {
    let isMounted = true;
    !appState.personalBalanceLoading &&
      dispatch({ type: "personalBalanceLoading", payload: true });
    !appState.systemBalanceLoading &&
      dispatch({ type: "systemBalanceLoading", payload: true });
    !appState.lockedBalanceLoading &&
      dispatch({ type: "fetchUserLockedBalance", payload: true });
    return () => {
      isMounted = false;
    };
  }, []);
  return (
    <FormModal
      title="Claim"
      toggle={toggle}
      handleSubmit={onFormSubmit}
      loader={load}
      updateTable={<UpdateTable amount={amount} text={"Available:"} />}
    >
      {error && <div className="error">{error}</div>}
      <div className="field">
        <div className="control">
          <Field
            name="amount"
            component="input"
            type="hidden"
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
              if (Number(value) > pendingRewards) {
                setWarning("Out of balance");
                return setLoader(true);
              } else {
                setWarning(null);
                setLoader(false);
              }
            }}
          />
        </div>
      </div>
      {warning && (
        <p className="mr-5 justify-content-center has-text-danger">{warning}</p>
      )}
    </FormModal>
  );
}
