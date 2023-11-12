import { Principal } from "@dfinity/principal";
import FormModal from "../../../app/modals/FormModal";
import { useActors } from "../../../../hooks/actors";
import {
  useAppState,
  useAppStateDispatch,
} from "../../../app/state_mgmt/context/state";

const RemoveRuleModal = ({ toggle, rule }) => {
  const { modclub } = useActors();
  const appState = useAppState();
  const dispatch = useAppStateDispatch();
  const onRemoveRuleFormSubmit = async (values: any) => {
    let result: string;

    if (rule && rule.id) {
      await modclub
        .removeRules([rule.id], [appState.selectedProvider.id])
        .then(async () => {
          dispatch({ type: "fetchUserProviders" });
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
