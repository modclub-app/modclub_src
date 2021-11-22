import { Form, Field } from "react-final-form";
import { useState } from "react";

export default function Withdraw({ toggle }) {
  const [ submitting, setSubmitting ] = useState<boolean>(false);
  const [message, setMessage] = useState(null);

  const onFormSubmit = async (values: any) => {
    console.log("onFormSubmit", values);
    const { amount } = values;
    setSubmitting(true);
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
              <h3 className="subtitle">Add Trusted Identify</h3>

              <div className="has-background-dark p-5" style={{ borderRadius: 4 }}>
                <div className="field">
                  <Field
                    name="id"
                    component="input"
                    type="text"
                    className="input"
                    placeholder="Principal ID"
                  />
                </div>
                <div className="field">
                  <Field
                    name="userName"
                    component="input"
                    type="text"
                    className="input"
                    placeholder="User Name"
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
                <button className="button is-primary" disabled={message}>
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