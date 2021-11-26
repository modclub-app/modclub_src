import { Field } from "react-final-form";
import { Level } from "react-bulma-components";
import FormModal from "../modals/FormModal";
import { unStakeTokens } from '../../../utils/api';


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

export default function Unstake({ toggle, tokenHoldings }) {  
  const onFormSubmit = async (values: any) => {
    const { amount } = values;
    return await unStakeTokens(amount);
  };

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
            max={tokenHoldings.stake}
          />
          <span className="icon is-right has-text-white mr-4">AMT</span>
        </div>
      </div>
    </FormModal>
  );
};