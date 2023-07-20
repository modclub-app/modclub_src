import { Principal } from "@dfinity/principal";
import { getProviderRules, removeRules } from "../../../utils/api";
import FormModal from "../modals/FormModal";

const RemoveRuleModal = ({
    toggle,
    rule,
    principalID,
    updateState,
    selectedProvider,
    updateProvider,
  }) => {
    const onRemoveRuleFormSubmit = async (values: any) => {
      let result: string;
  
      if (rule && rule.id) {
        await removeRules([rule.id], Principal.fromText(principalID))
          .then(async () => {
            let updatedRules = await getProviderRules(
              Principal.fromText(principalID)
            );
            updateState(updatedRules);
            selectedProvider.rules = updatedRules;
            updateProvider();
            result = "Rule Removed Successfully!";
          })
          .catch((e) => {
            console.log(e);
            result = e.message;
          })
          .finally(() => console.log("removed"));
        return result;
      } else {
        result = "Error in removing rule. RuleID is not provided.";
      }
    };
  
    return (
      <FormModal
        title="Remove rule"
        toggle={toggle}
        handleSubmit={onRemoveRuleFormSubmit}
      >
        <strong style={{ color: "#fff" }}>
          Are you really sure to remove following rule?
        </strong>
        <p style={{ marginTop: 8 }}>"{rule.description}"</p>
      </FormModal>
    );
  };

  export default RemoveRuleModal;
  
