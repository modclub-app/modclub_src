import { Field } from "react-final-form";
import { Level } from "react-bulma-components";
import FormModal from "../modals/FormModal";
import { stakeTokens } from '../../../utils/api';

const UpdateTable = ({ wallet, stake, amount = 0 }) => {
  return (
    <>
      <Level className="has-text-silver px-5">
        <span>Available:</span>
        <span className="has-text-weight-bold">{wallet}</span>
      </Level>
      <Level className="has-text-silver px-5">
        <span>Available after:</span>
        <span className="has-text-weight-bold">{wallet - amount}</span>
      </Level>
      <Level className="has-text-silver px-5">
        <span>Current Stake:</span>
        <span className="has-text-weight-bold">{stake}</span>
      </Level>
      <Level className="has-text-silver px-5">
        <span>After Stake:</span>
        <span className="has-text-weight-bold">{stake + Number(amount)}</span>
      </Level>
    </>
  )
}

export default function Stake({ toggle, tokenHoldings }) {  
  const onFormSubmit = async (values: any) => {
    const { amount } = values;
    return await stakeTokens(amount);
  };

  return (
    <FormModal
      title="Stake"
      toggle={toggle}
      handleSubmit={onFormSubmit}
      updateTable={<UpdateTable wallet={tokenHoldings.wallet} stake={tokenHoldings.stake} />}
    >
      <div className="field">
        <div className="control has-icons-right">
            <Field
            name="amount"
            component="input"
            type="number"
            className="input"
            initialValue={100}
            max={tokenHoldings.wallet}
          />
          <span className="icon is-right has-text-white mr-4">AMT</span>
        </div>
      </div>
    </FormModal>
  );
};