import * as React from "react";
import { useState } from "react";
import { Field } from "react-final-form";
import { Button, Icon, Level } from "react-bulma-components";
import PopupModal from "./PopupModal";
import { convert_to_mod } from "../../../utils/util";
import { useActors } from "../../../utils";
import { useAppState, useAppStateDispatch } from "../state_mgmt/context/state";
import * as Constant from "../../../utils/constant";
import { UnstakeHistoryTable } from "./UnstakeHistoryTable";
import { GTMEvent, GTMManager } from "../../../utils/gtm";

const UpdateTable = ({
  stake,
  amount = 0,
  tokenHoldings,
  pendingStakeList,
  lockBalance,
  digit,
}) => {
  const dispatch = useAppStateDispatch();
  const appState = useAppState();
  const unstakedBalance = convert_to_mod(
    appState.unlockStakeBalance,
    BigInt(appState.decimals)
  );
  return (
    <>
      <Level className="has-text-silver px-5">
        <span>Current Stake</span>
        <span className="has-text-weight-bold">{stake}</span>
      </Level>
      <Level className="has-text-silver px-5">
        <span>After Unstake</span>
        <span className="has-text-weight-bold">
          {Math.max(0, stake - amount)}
        </span>
      </Level>
      <p>Unstake in progress: </p>
      <UnstakeHistoryTable pendingStakeList={pendingStakeList} digit={digit} />
      <p className="is-size-7">
        <em style={{ fontWeight: 50, color: "#888" }}>
          {Constant.UNSTAKE_WARN_MSG(lockBalance)}
        </em>
      </p>
      <hr />
      <p>
        Release unstaked tokens: {unstakedBalance} MOD
        <Button
          color="primary"
          className={appState.releaseUnStakedLoading ? "is-loading" : ""}
          style={{ marginLeft: "10px" }}
          disabled={!(unstakedBalance > 0)}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            dispatch({ type: "setReleaseUnStakedLoading", payload: true });
          }}
        >
          Release
        </Button>
      </p>
    </>
  );
};

export default function Unstake({
  toggle,
  show,
  tokenHoldings,
  userId,
  digit,
  onUpdate,
}) {
  const { modclub } = useActors();
  const appState = useAppState();
  const dispatch = useAppStateDispatch();
  const [inputValue, setInputValue] = useState(0);
  const [load, setLoader] = useState(false);
  const [warning, setWarning] = useState(null);
  const pendingList = appState.pendingStakeList;
  const lockedBalance = convert_to_mod(
    appState.lockedBalance,
    appState.decimals
  );
  const stakeBalance = convert_to_mod(
    appState.stakeBalance,
    BigInt(appState.decimals)
  );
  const onFormSubmit = async (values: any) => {
    const { amount } = values;
    dispatch({ type: "unstakeTokensAction", payload: { amount } });

    // GTM: determine amount of UnStake users make into
    // their account and how many users made UnStake;
    GTMManager.trackEvent(
      GTMEvent.AccountTransaction,
      {
        uId: appState.loginPrincipalId,
        userLevel: Object.keys(appState.rs.level)[0],
        type: "unstake",
        amount,
      },
      ["uId"]
    );
  };

  return (
    <PopupModal
      title="Unstake"
      show={show}
      subtitle="Congratulation!"
      toggle={toggle}
      handleSubmit={onFormSubmit}
      button1="Submit"
      loader={!!appState.unstakeTokensAction}
      updateTable={
        <UpdateTable
          stake={stakeBalance}
          tokenHoldings={tokenHoldings}
          digit={digit}
          pendingStakeList={pendingList}
          lockBalance={lockedBalance}
        />
      }
    >
      <br />
      <div className="field">
        <div className="control has-icons-right">
          <Field
            name="amount"
            component="input"
            type="number"
            className={!load ? "input" : "input is-danger"}
            initialValue={inputValue}
            validate={(value) => {
              if (isNaN(value) || Number(value) <= 0) {
                setWarning("Incorrect amount");
                return setLoader(true);
              }
              if (Number(value) > stakeBalance) {
                setWarning("Out of balance");
                return setLoader(true);
              } else {
                setWarning(null);
                setLoader(false);
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
