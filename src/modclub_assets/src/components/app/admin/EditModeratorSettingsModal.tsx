import { Field } from "react-final-form";
import FormModal from "../modals/FormModal";
import { Principal } from "@dfinity/principal";
import { useActors } from "../../../hooks/actors";

const EditModeratorSettingsModal = ({
  toggle,
  principalID,
  selectedProvider,
  requiredVotes,
  minTokens,
  setrequiredVotes,
  setMinTokens,
  updateProvider,
}) => {
  const { modclub } = useActors();
  const onFormSubmit = async (values: any) => {
    for (const k in values) {
      if (!isNaN(values[k] / 1)) {
        values[k] = values[k] / 1;
      }
    }
    values["minStaked"] = values.minTokens;
    await modclub.updateSettings(Principal.fromText(principalID), values);
    setrequiredVotes(parseInt(values.requiredVotes));
    setMinTokens(parseInt(values.minTokens));
    selectedProvider.settings.requiredVotes = parseInt(values.requiredVotes);
    selectedProvider.settings.minTokens = parseInt(values.minTokens);
    updateProvider();
    return "Moderator settings updated successfully";
  };

  return (
    <FormModal
      title="Edit Moderator Settings"
      toggle={toggle}
      handleSubmit={onFormSubmit}
    >
      <div className="field level">
        <p>Number of votes required to finalize decision:</p>
        <Field
          name="requiredVotes"
          component="input"
          className="input has-text-centered ml-3"
          initialValue={requiredVotes}
          style={{ width: 70 }}
        />
      </div>

      <div className="field level">
        <p>Required number of staked MOD tokens to vote:</p>
        <Field
          name="minTokens"
          component="input"
          type="number"
          className="input has-text-centered ml-3"
          initialValue={minTokens}
          style={{ width: 70 }}
        />
      </div>
    </FormModal>
  );
};

export default EditModeratorSettingsModal;
