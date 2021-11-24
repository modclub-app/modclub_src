import { Form, Field } from "react-final-form";
import { useState } from "react";

export default function Withdraw({ toggle }) {
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

              <h3 className="subtitle">Edit App</h3>
              <div className="field">
                <div className="control">
                  <Field
                    name="name"
                    component="input"
                    type="text"
                    className="input"
                    placeholder="App Name"
                  />
                </div>
              </div>

              <div className="field">
                <div className="control">
                  <Field
                    name="description"
                    component="textarea"
                    className="textarea"
                    placeholder="App Description"
                  />
                </div>
              </div>

            </section>
            <footer className="modal-card-foot pt-0 is-justify-content-flex-end">
              <button className="button is-dark mr-4" onClick={toggle}>
                Cancel
              </button>
              {submitting ? 
                <button className="button is-primary" disabled>
                  <span className="icon mr-2 loader is-loading"></span>
                  <span>SUBMITTING...</span>
                </button> 
                :
                <button className="button is-primary" disabled={pristine}>
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