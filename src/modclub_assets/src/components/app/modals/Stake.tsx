import { Form, Field } from "react-final-form";
import FormModal from "../modals/FormModal";
import { useState } from "react";
import { stakeTokens } from '../../../utils/api';

export default function Stake({ toggle, tokenHoldings }) {

  // const [ submitting, setSubmitting ] = useState<boolean>(false);
  // const [message, setMessage] = useState(null);
  
  const onFormSubmit = async (values: any) => {
    // console.log("onFormSubmit", values);
    const { amount } = values;
    // setSubmitting(true);
    return await stakeTokens(amount);
    // console.log("result", result);
    // setMessage({ success: true, value: result });
    // setSubmitting(false);
    // setTimeout(() => toggle(), 2000); 
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