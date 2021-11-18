import { Form, Field } from "react-final-form";
import { useState } from "react";
import modalbgImg from '../../../../assets/modalbg.svg';

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
      <div className="modal-card" style={{ backgroundImage: `url(${modalbgImg})`}}>
        <section className="modal-card-body">
          <h3 className="subtitle mt-5">Withdraw</h3>

          <Form
            onSubmit={onFormSubmit}
            render={({ handleSubmit, form }) => (
              <form onSubmit={handleSubmit}>
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
                      value="100"
                    />
                    <span className="icon is-right has-text-white mr-4">AMT</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="button is-large is-primary is-fullwidth"
                  value="Submit"
                >
                  {submitting ? 
                  <>
                    <span className="loader is-loading"></span>
                    <span>SUBMITTING...</span>
                  </> : "SUBMIT"}
                </button>
              </form>
            )}
          />
        </section>
        {/* <footer className="modal-card-foot">
          <button className="button is-primary is-fullwidth">
            SUBMIT
          </button>
        </footer> */}
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