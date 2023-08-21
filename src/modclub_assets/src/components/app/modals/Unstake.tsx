import * as React from "react";
import { Field } from "react-final-form";
import { Level, Icon } from "react-bulma-components";
import { releaseStake, claimStake } from "../../../utils/api";
import PopupModal from "./PopupModal";
import {
  convert_to_mod,
  format_token,
  timestampToDate,
} from "../../../utils/util";
import { useState } from "react";
import { useActors } from "../../../utils";

const UpdateTable = ({
  stake,
  amount = 0,
  tokenHoldings,
  lockBlock,
  digit,
  userId,
}) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { modclub } = useActors();
  const hasLockBlock = Array.isArray(lockBlock) && lockBlock.length > 0;
  const [releaseUnlocked, setReleaseUnlocked] = useState(false);
  const unlockPrice = convert_to_mod(tokenHoldings.unLockedFor, digit);
  const claimPrice = convert_to_mod(tokenHoldings.claimStakedFor, digit);

  const onFormSubmit = async () => {
    try {
      const res = await releaseStake(modclub, tokenHoldings.unLockedFor);
      return { reserved: unlockPrice, transfer: res };
    } catch (error) {
      console.error("unStake Failed:", error);
    }
  };

  return (
    <>
      <Level className="has-text-silver px-5">
        <span>Current Stake</span>
        <span className="has-text-weight-bold">{stake}</span>
      </Level>
      <Level className="has-text-silver px-5">
        <span>Claim Stake amount: </span>
        <span className="has-text-weight-bold">{claimPrice}</span>
      </Level>
      <Level className="has-text-silver px-5">
        <span>Unlock amount:</span>
        <span className="has-text-weight-bold">{unlockPrice}</span>
      </Level>
      <Level className="has-text-silver px-5">
        <span>After Unstake</span>
        <span className="has-text-weight-bold">
          {Math.max(0, stake - amount)}
        </span>
      </Level>
      {hasLockBlock && (
        <Level
          className="has-text-silver px-5"
          style={{
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
          }}
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
        >
          Show Unstake History
          {isHistoryOpen ? (
            <Icon
              style={{
                color: "info",
                alignItems: "right",
                fontSize: "30px",
                marginLeft: "auto",
              }}
            >
              <b>{"<"}</b>
            </Icon>
          ) : (
            <Icon
              style={{
                color: "info",
                alignItems: "right",
                fontSize: "35px",
                marginLeft: "auto",
              }}
            >
              <b>{">"}</b>
            </Icon>
          )}
        </Level>
      )}
      {hasLockBlock && isHistoryOpen && (
        <>
          {lockBlock.map((block, index) => (
            <Level key={index} className="has-text-silver px-5">
              <span className="has-text-weight-bold">
                {convert_to_mod(block.amount, digit)}
              </span>
              <span className="has-text-silver px-5">
                MOD tokens release on
              </span>
              <span className="has-text-weight-bold">
                {timestampToDate(
                  Number(block.created_at_time) + Number(block.dissolveDelay)
                )}
              </span>
            </Level>
          ))}
        </>
      )}
      {tokenHoldings.unLockedFor > 0 && (
        <Level
          className="has-text-silver px-5"
          style={{
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
          }}
          onClick={() => setReleaseUnlocked(!releaseUnlocked)}
        >
          Release Unlocked Token
          {releaseUnlocked ? (
            <Icon
              style={{
                color: "info",
                alignItems: "right",
                fontSize: "30px",
                marginLeft: "auto",
              }}
            >
              <b>{"<"}</b>
            </Icon>
          ) : (
            <Icon
              style={{
                color: "info",
                alignItems: "right",
                fontSize: "35px",
                marginLeft: "auto",
              }}
            >
              <b>{">"}</b>
            </Icon>
          )}
        </Level>
      )}
      {releaseUnlocked && (
        <PopupModal
          title="Release Token"
          subtitle="Congratulation!"
          toggle={() => {
            setReleaseUnlocked(!releaseUnlocked);
          }}
          handleSubmit={onFormSubmit}
        >
          <Level className="has-text-silver px-5">
            <span className="has-text-weight-bold">
              {format_token(unlockPrice)}
            </span>
            <span className="has-text-silver px-5">AMT</span>
          </Level>
        </PopupModal>
      )}
    </>
  );
};

export default function Unstake({
  toggle,
  tokenHoldings,
  userId,
  lockBlock,
  digit,
  onUpdate,
}) {
  const { modclub } = useActors();
  const onFormSubmit = async (values: any) => {
    const { amount } = values;
    try {
      const amounts: number = Number(amount) * Math.pow(10, Number(digit));
      const res = await claimStake(modclub, BigInt(amounts));
      return { reserved: Number(amount), transfer: res };
    } catch (error) {
      console.error("unStake Failed:", error);
    }
  };
  const preventMax = (e) => {
    if (parseInt(e.target.value) > tokenHoldings.stake) {
      e.target.value = tokenHoldings.stake;
    }
  };

  return (
    <PopupModal
      title="Unstake"
      subtitle="Congratulation!"
      toggle={toggle}
      handleSubmit={onFormSubmit}
      button1="Release Stake"
      updateTable={
        <UpdateTable
          stake={tokenHoldings.stake}
          tokenHoldings={tokenHoldings}
          lockBlock={lockBlock}
          digit={digit}
          userId={userId}
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
            initialValue={tokenHoldings.stake}
            onInput={preventMax}
          />
          <Icon align="right" color="white" className="mr-4">
            AMT
          </Icon>
        </div>
      </div>
    </PopupModal>
  );
}
