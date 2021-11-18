import { Form, Field } from "react-final-form";
import { useState } from "react";

const Modal = ({
  active,
  toggle,
}: {
  active: boolean;
  toggle: () => void;
}) => {
  const [ submitting, setSubmitting ] = useState<boolean>(false);
  
  const onFormSubmit = async (values: any) => {
    console.log("onFormSubmit", values);
    const { address, amount } = values;
    setSubmitting(true);
  };
  
  return (
    <div className={`modal ${active ? "is-active" : ""}`}>
      <div className="modal-background" onClick={toggle} />
      <div className="modal-card is-small has-background-circles">
      <Form
        onSubmit={onFormSubmit}
        render={({ handleSubmit, pristine }) => (
          <form onSubmit={handleSubmit}>
            <section className="modal-card-body">
              <h3 className="subtitle mt-5">Withdraw</h3>
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
                    initialValue="100"
                  />
                  <span className="icon is-right has-text-white mr-4">AMT</span>
                </div>
              </div>
            </section>
            <footer className="modal-card-foot">
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

export default function Withdraw() {
  const [active, setActive] = useState(false);
  const toggle = () => setActive(!active);

  return (
    <>
      <button className="button is-dark is-fullwidth" onClick={toggle}>Withdraw</button>
      <Modal
        active={active}
        toggle={toggle}
      />
    </>
  );
};