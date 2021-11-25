import React from "react";
import { useState } from "react";
import { Modal, Heading, Level, Button, Notification } from "react-bulma-components";
import { Form } from "react-final-form";


// const { Provider, Consumer } = React.createContext;


export default function FormModal({
  toggle,
  title,
  children,
  handleSubmit,
  footerContent = null,
  updateTable = null
}) {
  const [ submitting, setSubmitting ] = useState<boolean>(false);
  const [message, setMessage] = useState(null);
  
  const onFormSubmit = async (values: any) => {
    console.log("FormModal values", values);
    setSubmitting(true);

    try {
      const result = await handleSubmit(values)
      console.log("child result", result);
      setSubmitting(false);
      setMessage({ success: true, value: result });
    } catch (e) {
      console.log("e", e);
      // setSubmitting(false);
      // setMessage({ success: false, value: e });
    }
    setTimeout(() => toggle(), 2000);
  };

  return (
    <Modal show={true} onClose={toggle} closeOnBlur={true} showClose={false}>
      <Modal.Card className="is-small has-background-circles">
        <Form
          onSubmit={onFormSubmit}
          render={({ handleSubmit, values }) => (
            <form onSubmit={handleSubmit}>
              <Modal.Card.Body>

              <Heading subtitle>
                {title}
              </Heading>

                  {children}

                  {/* {React.cloneElement(children[0], { values: values })} */}

                  {/* <Provider values={values}>
                    {children}
                  </Provider> */}
{/* 
                  {children.map(child => 
                    {React.cloneElement(children[0], { values: values })}
                  )} */}

                  {/* {updateTable && updateTable.map(item => 
                    <Level key={item.title} className="has-text-silver px-5">
                      <span>{item.title}</span>
                      <span className="has-text-weight-bold">{item.value}</span>
                    </Level>
                  )} */}

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
                  <Button color="primary" disabled={message || submitting}>
                    {submitting ? (
                      <>
                        <span className="icon mr-2 loader is-loading"></span>
                        <span>SUBMITTING...</span>
                      </>
                      ) : "Submit"
                    }
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