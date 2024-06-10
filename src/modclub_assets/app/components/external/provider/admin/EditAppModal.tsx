import React from 'react';
import { Field } from "react-final-form";
import FormModal from "../../../app/modals/FormModal";
import { Principal } from "@dfinity/principal";
import { useActors } from "../../../../hooks/actors";
import {
  useAppState,
  useAppStateDispatch,
} from "../../../app/state_mgmt/context/state";

const EditAppModal = ({ toggle }) => {
  const { modclub } = useActors();
  const appState = useAppState();
  const dispatch = useAppStateDispatch();
  const onFormSubmit = async (values: any) => {
    try {
      await modclub.updateProvider(appState.selectedProvider.id, values);
      dispatch({ type: "fetchUserProviders" });
      return (
        "Provider " + appState.selectedProvider?.name + " updated successfully."
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <FormModal title="Edit App" toggle={toggle} handleSubmit={onFormSubmit}>
      <div className="field" style={{ marginTop: "10px" }}>
        <div className="control">
          <Field
            name="name"
            component="input"
            type="text"
            className="input"
            placeholder="App Name"
            initialValue={appState.selectedProvider?.name}
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
            initialValue={appState.selectedProvider?.description}
          />
        </div>
      </div>
    </FormModal>
  );
};

export default EditAppModal;
