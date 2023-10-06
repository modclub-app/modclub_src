import * as React from 'react'
import { useState } from "react";
import { Modal, Heading, Button, Notification } from "react-bulma-components";
import { Form } from "react-final-form";
import { format_token } from '../../../utils/util';
interface PopupModal {
  toggle: () => void;
  title: string;
  subtitle: string;
  handleSubmit: (values) => any
  children: React.ReactNode;
  footerContent?: any;
  updateTable?: any;
  formStyle?: any;
  loader?:any;
  button1?:string;
}

export default function PopupModal({
  toggle,
  title,
  subtitle,
  children,
  handleSubmit,
  formStyle = null,
  updateTable = null,
  footerContent = null,
  loader = null,
  button1 = "Submit"
}: PopupModal) {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState(null);

  const onFormSubmit = async (values: any) => {
    setSubmitting(true);

    try {
      const result = await handleSubmit(values)
      setSubmitting(false);
      if (result.transfer) {
        if(result.transfer.Ok !== undefined || result.transfer.ok !== undefined){
          if(title.toLowerCase() == "deposit"){
            setMessage({ success: true, value: `You have successfully ${title.toLowerCase()} ${format_token(result.reserved)} AMT into your Mod wallet. Time to start your moderator journey with Modclub.` });
          }else if (title.toLowerCase() == "withdraw"){
            setMessage({ success: true, value: `You have successfully ${title.toLowerCase()} ${format_token(result.reserved)} AMT back into your own wallet.` });
          }else if (title.toLowerCase() == "unstake"){
            setMessage({ success: true, value: `You have successfully ${title.toLowerCase()} ${format_token(result.reserved)} AMT back into your locked wallet that you can release within 7days.` });
          }else if (title.toLowerCase() == "claim"){
            setMessage({ success: true, value: `You have successfully ${title.toLowerCase()} ${format_token(result.reserved)} AMT back into your locked wallet that you can release within 7days.` });
          }else {
            setMessage({ success: true, value: `You have successfully ${title.toLowerCase()} ${format_token(result.reserved)} AMT.` })
          }
        }else{
          setMessage({ success: false, value: `${Object.keys(result.transfer.Err || result.transfer.err)}` });            
        }
      } else {
        setMessage({ success: false, value: `${title} is failed, Please try again later.` });
      }
    } catch (e) {
      setSubmitting(false);
      let errorMessage = 'An unexpected error occurred.';
      if (e.message && e.message.includes('Reject text')) {
        let errAr = /Reject text: (.*)/g.exec(e.message);
        errorMessage = errAr ? errAr[1] : errorMessage;
      }
      setMessage({ success: false, value: errorMessage });
    }
  };
  return (
    <Modal show={true} onClose={toggle} closeOnBlur={true} showClose={false}>
      {!message ? (<Modal.Card backgroundColor="circles" className="is-small">
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
                >
                  {button1}
                </Button>
              </Button.Group>
            </Modal.Card.Footer>
          </form>
        )}
        />
      </Modal.Card>):(
        <Modal.Card backgroundColor="circles" className="is-small">
          <Modal.Card.Body style={formStyle}>
              <Heading subtitle>
                {message.success ? subtitle: "Failed"}
              </Heading>
              <br/>
              {message.value}
            </Modal.Card.Body>
            <Modal.Card.Footer className="pt-0 is-justify-content-flex-end">
              <Button.Group>
                <Button color="primary" onClick={toggle}>
                  Return to homepage
                </Button>
              </Button.Group>
            </Modal.Card.Footer>
      </Modal.Card>
      )}
    </Modal>
  );
};