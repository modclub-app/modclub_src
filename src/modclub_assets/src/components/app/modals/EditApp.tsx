import { Form, Field } from "react-final-form";
import { useState } from "react";
import FormModal from "../modals/FormModal";

export default function EditApp({ toggle }) {  
  const onFormSubmit = async (values: any) => {
    console.log("onFormSubmit parent!", values)
    const { address, amount } = values;
    return "Sample success return";
  };

  return (
    <FormModal title="Edit App" toggle={toggle} handleSubmit={onFormSubmit}>
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
    </FormModal>
  );
};