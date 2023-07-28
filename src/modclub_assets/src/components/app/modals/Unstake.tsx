import * as React from 'react'
import { Field } from "react-final-form";
import { Level, Icon } from "react-bulma-components";
import { icrc1Decimal, unStakeTokens } from '../../../utils/api';
import PopupModal from './PopupModal';

const UpdateTable = ({ stake, amount = 0, unlocked }) => {
  return (
    <>
      <Level className="has-text-silver px-5">
        <span>Current Stake</span>
        <span className="has-text-weight-bold">{stake}</span>
      </Level>
      <Level className="has-text-silver px-5">
        <span>Unlock amount:</span>
        <span className="has-text-weight-bold">{unlocked}</span>
      </Level>
      <Level className="has-text-silver px-5">
        <span>After Unstake</span>
        <span className="has-text-weight-bold">{Math.max(0, stake - amount)}</span>
      </Level>
      <Level className="has-text-silver px-5">
        <span>Stake will be released on</span>
        <span className="has-text-weight-bold">9/12/2021</span>
      </Level>
    </>
  )
}

export default function Unstake({ toggle, tokenHoldings, onUpdate }) {  
  const onFormSubmit = async (values: any) => {
    const { amount } = values;
    try {
      const digit = await icrc1Decimal();
      const amounts : number = Number(amount)*Math.pow(10, Number(digit))
      const res = await unStakeTokens(amounts);
      return {reserved: Number(amount), transfer: res};
    } catch (error) {
      console.error("unStake Failed:", error);
    }
  };

  const preventMax = (e) => {
    if (parseInt(e.target.value) > tokenHoldings.stake) {
      e.target.value = tokenHoldings.stake; 
    }
  }

  return (
    <PopupModal
      title="Unstake"
      subtitle="Congratulation!"
      toggle={toggle}
      handleSubmit={onFormSubmit}
      updateTable={<UpdateTable stake={tokenHoldings.stake} unlocked = {tokenHoldings.unLockedFor}/>}
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
};