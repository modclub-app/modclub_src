import { Field } from "react-final-form";
import FormModal from "../modals/FormModal";
import { Principal } from "@dfinity/principal";
import { addRules, getProviderRules, updateRule } from "../../../utils/api";
import { useState } from "react";

const EditRulesModal = ({
    rules,
    toggle,
    principalID,
    updateState,
    selectedProvider,
    updateProvider,
  }) => {
    const [newRules, setNewRules] = useState(rules);
    const [loader, setLoader] = useState(false);
    let rulesBeingEdited = {};
  
    let addNewRuleField = [{ id: 1, description: "" }];
    const [newRulesFieldArr, setNewRulesFieldArr] = useState(addNewRuleField);
  
    const createNewAddRuleField = (e) => {
      e.preventDefault();
      setNewRulesFieldArr((nfr) => {
        return [...nfr, { id: newRulesFieldArr.length + 1, description: "" }];
      });
    };
  
    const handleChange = (e) => {
      e.preventDefault();
      const index = e.target.id;
      setNewRulesFieldArr((s) => {
        const newArr = s.slice();
        newArr[index].description = e.target.value;
  
        return newArr;
      });
    };
  
    const onFormSubmit = async (values: any) => {
      let newRulesToAdd = [];
      for (const [key, value] of Object.entries(values)) {
        if (key.split("_")[0] == "newRule" && value !== "") {
          newRulesToAdd.push(value);
        }
      }
  
      let result;
      await addRules(newRulesToAdd, Principal.fromText(principalID))
        .then(async () => {
          let updateRulePromise = [];
          for (let principalID in rulesBeingEdited) {
            updateRulePromise.push(
              updateRule(
                rulesBeingEdited[principalID],
                Principal.fromText(principalID)
              )
            );
          }
          await Promise.all(updateRulePromise);
          result = "Rules updated successfully";
        })
        .then(async () => {
          let updatedRules = await getProviderRules(
            Principal.fromText(principalID)
          );
          updateState(updatedRules);
          setNewRules(updatedRules);
          selectedProvider.rules = updatedRules;
          updateProvider();
        })
        .catch((e) => {
          console.log(e);
          result = e.message;
        });
      rulesBeingEdited = {};
      return result;
    };
  
    return (
      <FormModal
        title="Add Rules"
        toggle={toggle}
        handleSubmit={onFormSubmit}
        loader={loader}
        formStyle={{ maxHeight: "500px", overflow: "auto" }}
      >
        {newRulesFieldArr.map((rule, idx) => (
          <div className="field level" key={rule.id}>
            <Field
              name={"newRule_" + idx.toString()}
              component="input"
              id={idx}
              type="text"
              className="input"
              placeholder="Add New Restriction"
              onBlur={handleChange}
              initialValue={rule.description}
            />
            {idx == newRulesFieldArr.length - 1 ? (
              <span className="icon has-text-success ml-3">
                <span className="material-icons" onClick={createNewAddRuleField}>
                  add_circle
                </span>
              </span>
            ) : (
              ""
            )}
          </div>
        ))}
      </FormModal>
    );
  };

  export default EditRulesModal;