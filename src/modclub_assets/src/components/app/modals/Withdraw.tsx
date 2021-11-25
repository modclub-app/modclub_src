import { Field } from "react-final-form";
import FormModal from "../modals/FormModal";
import { useState } from "react";

export default function Withdraw({ toggle, tokenHoldings }) {
  const [ submitting, setSubmitting ] = useState<boolean>(false);
  
  const onFormSubmit = async (values: any) => {
    console.log("onFormSubmit", values);
    const { amount } = values;
    // return await unStakeTokens(amount);
  };

  return (
    <FormModal
      title="Withdraw"
      toggle={toggle}
      handleSubmit={onFormSubmit}
    >
      <div className="field">
        <div className="control">
          <Field
            name="address"
            component="input"
            type="text"
            className="input"
            placeholder="Wallet Address"
          />
        </div>
      </div>
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
    </FormModal>
  );
};