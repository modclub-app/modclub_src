import { Field } from "react-final-form";
import FormModal from "../modals/FormModal";
import { Principal } from "@dfinity/principal";
import { useActors } from "../../../hooks/actors";

const EditAppModal = ({
  toggle,
  principalID,
  selectedProvider,
  updateProvider,
}) => {
  const { modclub } = useActors();
  const onFormSubmit = async (values: any) => {
    await modclub.updateProvider(Principal.fromText(principalID), values);
    selectedProvider.name = values.name;
    selectedProvider.description = values.description;
    updateProvider();
    return "App Edited Successfully";
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
            initialValue={!!selectedProvider ? selectedProvider.name : ""}
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
            initialValue={
              !!selectedProvider ? selectedProvider.description : ""
            }
          />
        </div>
      </div>
    </FormModal>
  );
};

export default EditAppModal;
