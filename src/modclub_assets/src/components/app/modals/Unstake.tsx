import { Form, Field } from "react-final-form";
import { useState } from "react";
import { unStakeTokens } from '../../../utils/api';

export default function Withdraw({ toggle, tokenHoldings }) {
  const [ submitting, setSubmitting ] = useState<boolean>(false);
  const [message, setMessage] = useState(null);

  const onFormSubmit = async (values: any) => {
    console.log("onFormSubmit", values);
    const { amount } = values;
    setSubmitting(true);
    const result = await unStakeTokens(amount);
    console.log("result", result);
    setMessage({ success: true, value: result });
    setSubmitting(false);
    setTimeout(() => toggle(), 2000); 
  };

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={toggle} />
      <div className="modal-card is-small has-background-circles">
      <Form
        onSubmit={onFormSubmit}
        render={({ handleSubmit, values }) => (
          <form onSubmit={handleSubmit}>
            <section className="modal-card-body">
              <h3 className="subtitle">Unstake</h3>
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

              <div className="field level px-5 pt-5">
                <span className="has-text-silver">Current Stake:</span>
                <label className="label">{tokenHoldings.stake}</label>
              </div>
              <div className="field level px-5">
                <span className="has-text-silver">After Stake:</span>
                <label className="label">{tokenHoldings.stake - (values.amount ? values.amount : 0)}</label>
              </div>
              <div className="field level px-5">
                <span className="has-text-silver">Stake will be released on:</span>
                <label className="label">9/12/2021</label>
              </div>
            </section>
            <footer className="modal-card-foot pt-0">
            {submitting ? 
              <button className="button is-primary is-fullwidth" disabled>
                <span className="icon mr-2 loader is-loading"></span>
                <span>SUBMITTING...</span>
              </button> 
              :
              <button className="button is-primary is-fullwidth" disabled={message}>
                SUBMIT
              </button>
            }
            </footer>
          </form>
        )}
      />
      </div>
      {message &&
        <div className={`notification has-text-centered ${message.success ? "is-success" : "is-danger"}`}>
          {message.value}
        </div>
      }
    </div>
  );
};