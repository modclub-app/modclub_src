import * as React from 'react'
import { useState } from "react";
import { Modal, Heading, Button, Notification } from "react-bulma-components";
import { Form } from "react-final-form";

// export default function FormModal({
//   toggle,
//   title,
//   handleSubmit,
//   children,
//   footerContent,
//   updateTable
// }: {
//   toggle: () => void;
//   title: string;
//   handleSubmit: () => void;
//   children: React.ReactNode;
//   footerContent: any;
//   updateTable: any;
// }) {

export default function FormModal({
  toggle,
  title,
  children,
  handleSubmit,
  formStyle = null,
  updateTable = null,
  footerContent = null,
  loader = null
}) {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState(null);

  const onFormSubmit = async (values: any) => {
    console.log("FormModal values", values);
    setSubmitting(true);

    // const regEx = /Reject text: (.*)/g;
    try {
      const result = await handleSubmit(values)
      setSubmitting(false);
      console.log("RESULT", result);
      
      if (result) {
        if (typeof result == "string" &&  (result == "Values entered not valid") || (result.includes("checksum")))
          setMessage({ success: false, value: result });
        else
          setMessage({ success: true, value: result });
      } else {
        setMessage({ success: false, value: "Withdraw and Deposit is not functional in Test Net" });
      }
    } catch (e) {
      // let errAr = regEx.exec(e.message);
      console.log(e);
      setSubmitting(false);
      setMessage({ success: false, value: e.message });
    }
    setTimeout(() => toggle(), 2000);
  };
  return (
    <Modal show={true} onClose={toggle} closeOnBlur={true} showClose={false}>
      <Modal.Card backgroundColor="circles" className="is-small">
        <Form onSubmit={onFormSubmit} render={({ handleSubmit, values }) => (
          <form onSubmit={handleSubmit}>
            <Modal.Card.Body style={formStyle}>
              <Heading subtitle>
                {title}
              </Heading>

              {children}

              {updateTable &&
                React.cloneElement(updateTable, { amount: values.amount })
              }
            </Modal.Card.Body>
            <Modal.Card.Footer className="pt-0 is-justify-content-flex-end">
              <Button.Group>
                <Button color="dark" onClick={toggle}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  disabled={message || submitting || loader}
                  className={ (submitting || loader) && "is-loading"}
                >
                  Submit
                </Button>
              </Button.Group>
            </Modal.Card.Footer>
          </form>
        )}
        />
      </Modal.Card>
      {message &&
        <Notification color={message.success ? "success" : "danger"} className="has-text-centered">
          {message.value}
        </Notification>
      }
    </Modal>
  );
};