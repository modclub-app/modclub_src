import * as React from "react";
import { useState, useEffect } from "react";
import { Modal, Heading, Button, Notification } from "react-bulma-components";
import { Form } from "react-final-form";
import { format_token, getErrorMessage, isObject } from "../../../utils/util";
interface PopupModal {
  toggle: () => void;
  show: boolean;
  title: string;
  subtitle: string;
  handleSubmit: (values) => any;
  children: React.ReactNode;
  footerContent?: any;
  updateTable?: any;
  formStyle?: any;
  loader?: any;
  button1?: string;
  isSubmitDisabled?: boolean;
}

export default function PopupModal({
  toggle,
  show,
  title,
  subtitle,
  children,
  handleSubmit,
  formStyle = null,
  updateTable = null,
  footerContent = null,
  loader = null,
  button1 = "Submit",
  isSubmitDisabled = false,
}: PopupModal) {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!show) setMessage(null);
  }, [show]);

  const cancelModal = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setMessage(null);
    toggle && toggle();
  };

  const onFormSubmit = async (values: any) => {
    setSubmitting(true);

    try {
      const result = await handleSubmit(values);
      if (result.transfer) {
        if (
          result.transfer.Ok !== undefined ||
          result.transfer.ok !== undefined
        ) {
          if (title.toLowerCase() == "deposit") {
            setMessage({
              success: true,
              value: `You have successfully ${title.toLowerCase()} ${format_token(
                result.reserved
              )} MOD into your Modclub wallet. Time to start your moderator journey with Modclub.`,
            });
          } else if (title.toLowerCase() == "deposit provider") {
            setMessage({
              success: true,
              value: `You have successfully deposit ${format_token(
                result.reserved
              )} MOD into your provider Modclub wallet. Time to start your journey with Modclub.`,
            });
          } else if (title.toLowerCase() == "withdraw") {
            setMessage({
              success: true,
              value: `You have successfully ${title.toLowerCase()} ${format_token(
                result.reserved
              )} MOD back into your own wallet.`,
            });
          } else if (title.toLowerCase() == "unstake") {
            setMessage({
              success: true,
              value: `You have successfully ${title.toLowerCase()} ${format_token(
                result.reserved
              )} MOD back into your locked wallet that you can release within 7days.`,
            });
          } else if (title.toLowerCase() == "claim") {
            setMessage({
              success: true,
              value: `You have successfully ${title.toLowerCase()} ${format_token(
                result.reserved
              )} MOD back into your locked wallet that you can release within 7days.`,
            });
          } else {
            setMessage({
              success: true,
              value: `You have successfully ${title.toLowerCase()} ${format_token(
                result.reserved
              )} MOD.`,
            });
          }
        } else {
          setMessage({
            success: false,
            value: `${getErrorMessage(
              result.transfer.Err || result.transfer.err
            )}`,
          });
        }
      } else {
        setMessage({
          success: false,
          value: `${title} is failed, Please try again later.`,
        });
      }
    } catch (e) {
      let errorMessage = "An unexpected error occurred.";
      if (e.message && e.message.includes("Reject text")) {
        let errAr = /Reject text: (.*)/g.exec(e.message);
        errorMessage = errAr ? errAr[1] : errorMessage;
      }
      setMessage({ success: false, value: errorMessage });
    }
    setSubmitting(false);
  };
  return (
    <Modal show={show} onClose={toggle} closeOnBlur={true} showClose={false}>
      {!message ? (
        <Modal.Card backgroundColor="circles" className="is-small">
          <Form
            onSubmit={onFormSubmit}
            render={({ handleSubmit, values }) => (
              <form onSubmit={handleSubmit}>
                <Modal.Card.Body style={formStyle}>
                  <Heading subtitle className={"is-3"}>
                    {title}
                  </Heading>

                  {children}

                  {updateTable &&
                    React.cloneElement(updateTable, { amount: values.amount })}
                </Modal.Card.Body>
                <Modal.Card.Footer className="pt-0 is-justify-content-flex-end">
                  <Button.Group>
                    <Button
                      disabled={submitting}
                      color="dark"
                      onClick={cancelModal}
                    >
                      Cancel
                    </Button>
                    <Button
                      color="primary"
                      className={submitting ? "is-loading" : ""}
                      disabled={
                        message || submitting || loader || isSubmitDisabled
                      }
                    >
                      {button1}
                    </Button>
                  </Button.Group>
                </Modal.Card.Footer>
              </form>
            )}
          />
        </Modal.Card>
      ) : (
        <Modal.Card backgroundColor="circles" className="is-small">
          <Modal.Card.Body style={formStyle}>
            <Heading subtitle>{message.success ? subtitle : "Failed"}</Heading>
            <br />
            {message.value}
          </Modal.Card.Body>
          <Modal.Card.Footer className="pt-0 is-justify-content-flex-end">
            <Button.Group>
              <Button color="primary" onClick={toggle}>
                Ok
              </Button>
            </Button.Group>
          </Modal.Card.Footer>
        </Modal.Card>
      )}
    </Modal>
  );
}
