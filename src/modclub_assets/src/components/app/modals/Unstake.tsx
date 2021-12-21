import { Field } from "react-final-form";
import { Level, Icon } from "react-bulma-components";
import FormModal from "../modals/FormModal";
import { unStakeTokens } from '../../../utils/api';
import { resourceUsage } from "process";

const UpdateTable = ({ stake, amount = 0 }) => {
  return (
    <>
      <Level className="has-text-silver px-5">
        <span>Current Stake</span>
        <span className="has-text-weight-bold">{stake}</span>
      </Level>
      <Level className="has-text-silver px-5">
        <span>After Stake</span>
        <span className="has-text-weight-bold">{stake - amount}</span>
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
    let res = await unStakeTokens(amount);
    onUpdate();
    return res;
  };

  const preventMax = (e) => {
    if (parseInt(e.target.value) > tokenHoldings.stake) {
      e.target.value = tokenHoldings.stake; 
    }
  }

  return (
    <FormModal
      title="Unstake"
      toggle={toggle}
      handleSubmit={onFormSubmit}
      updateTable={<UpdateTable stake={tokenHoldings.stake} />}
    >
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