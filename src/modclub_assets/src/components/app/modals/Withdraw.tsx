import { Form, Field } from "react-final-form";
import { useState } from "react";

export default function Withdraw({ toggle, tokenHoldings }) {
  const [ submitting, setSubmitting ] = useState<boolean>(false);
  
  const onFormSubmit = async (values: any) => {
    console.log("onFormSubmit", values);
    const { address, amount } = values;
    setSubmitting(true);
  };

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={toggle} />
      <div className="modal-card is-small has-background-circles">
      <Form
        onSubmit={onFormSubmit}
        render={({ handleSubmit, values, pristine }) => (
          <form onSubmit={handleSubmit}>
            <section className="modal-card-body">
              <h3 className="subtitle">Withdraw</h3>
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
                <label className="label">{tokenHoldings.wallet - (values.amount ? values.amount : 0)}</label>
              </div>

            </section>
            <footer className="modal-card-foot pt-0">
            {submitting ? 
              <button className="button is-primary is-fullwidth" disabled>
                <span className="icon mr-2 loader is-loading"></span>
                <span>SUBMITTING...</span>
              </button> 
              :
              <button className="button is-primary is-fullwidth" disabled={pristine}>
                SUBMIT
              </button>
            }
            </footer>
          </form>
        )}
      />
      </div>
    </div>
  );
};