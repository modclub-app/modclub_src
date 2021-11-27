import React from "react";
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
  updateTable = null,
  footerContent = null
}) {
  const [ submitting, setSubmitting ] = useState<boolean>(false);
  const [message, setMessage] = useState(null);
  
  const onFormSubmit = async (values: any) => {
    console.log("FormModal values", values);
    setSubmitting(true);

    // const regEx = /Reject text: (.*)/g;
    try {
      const result = await handleSubmit(values)
      console.log("child result", result);
      setSubmitting(false);
      setMessage({ success: true, value: result });
    } catch (e) {
      // let errAr = regEx.exec(e.message);
      setMessage({ success: false, value: e.message });
      setSubmitting(false);
    }
    setTimeout(() => toggle(), 2000);
  };

  return (
    <Modal show={true} onClose={toggle} closeOnBlur={true} showClose={false}>
      <Modal.Card backgroundColor="circles" className="is-small">
        <Form
          onSubmit={onFormSubmit}
          render={({ handleSubmit, values }) => (
            <form onSubmit={handleSubmit}>
              <Modal.Card.Body>
                <Heading subtitle>
                  {title}
                </Heading>

                {children}

                {updateTable &&
                  React.cloneElement(updateTable, { amount: values.amount })
                }            
              </Modal.Card.Body>
              <Modal.Card.Footer className="pt-0 is-justify-content-flex-end">
                {/* {footerContent &&
                  <div style={{ marginRight: "auto", position: "relative" }}>
                    {footerContent}
                  </div>
                } */}
                <Button.Group>
                  <Button color="dark" onClick={toggle}>
                    Cancel
                  </Button>
                  <Button color="primary" disabled={message || submitting} className={submitting && "is-loading"}>
                    Submit
                  </Button>
                  {/* <Button color="primary" disabled={message || submitting}>
                    {submitting ? (
                      <>
                        <span className="icon mr-2 loader is-loading"></span>
                        <span>SUBMITTING...</span>
                      </>
                      ) : "Submit"
                    }
                  </Button> */}
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