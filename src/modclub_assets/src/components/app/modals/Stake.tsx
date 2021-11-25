import { Field } from "react-final-form";
import FormModal from "../modals/FormModal";
import { stakeTokens } from '../../../utils/api';

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

      <div className="field level px-5 pt-5">
        <span className="has-text-silver">Available:</span>
        <label className="label">{tokenHoldings.wallet}</label>
      </div>
      <div className="field level px-5">
        <span className="has-text-silver">Available after:</span>
        {/* <label className="label">{tokenHoldings.wallet - (values.amount ? values.amount : 0)}</label> */}
      </div>
      <div className="field level px-5">
        <span className="has-text-silver">Current Stake:</span>
        <label className="label">{tokenHoldings.stake}</label>
      </div>
      <div className="field level px-5">
        <span className="has-text-silver">After Stake:</span>
        {/* <label className="label">{tokenHoldings.stake + Number((values.amount ? values.amount : 0))}</label> */}
      </div>
    </FormModal>
  );
};