import * as React from "react";
import { Field } from "react-final-form";
import { useEffect, useState } from "react";

import {
  Columns,
  Card,
  Button,
  Heading,
  Modal,
  Media,
  Image,
  Notification,
} from "react-bulma-components";
import FormModal from "../modals/FormModal";
import {
  addRules,
  updateRule,
  removeRules,
  getProviderRules,
  getProvider,
  updateProviderSettings,
  getUserFromCanister,
  getAdminProviderIDs,
} from "../../../utils/api";
import TrustedIdentities from "./TrustedIdentities";
import walletImg from "../../../../assets/wallet.svg";
import stakedImg from "../../../../assets/staked.svg";
import { Principal } from "@dfinity/principal";
import AdminIdentity from "../../external/AdminIdentity";

const EditAppModal = ({ toggle, selectedProvider }) => {
  const onFormSubmit = async (values: any) => {
    console.log("onFormSubmit parent!", values);
    const { address, amount } = values;
    return "EditAppModal success return";
  };

  return (
    <FormModal title="Edit App" toggle={toggle} selectedProvider={selectedProvider} handleSubmit={onFormSubmit}>
      <div className="field">
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
            initialValue={!!selectedProvider ? selectedProvider.description : ""}
          />
        </div>
      </div>
    </FormModal>
  );
};

const EditRulesModal = ({ rules, toggle, principalID, updateState }) => {
  const [newRules, setNewRules] = useState(rules);
  const [loader, setLoader] = useState(false);
  let rulesBeingEdited = {};

  let addNewRuleField = [{ id: 1, description: "" }];
  const [newRulesFieldArr, setNewRulesFieldArr] = useState(addNewRuleField);

  console.log("EDIT principalID", principalID)

  // const add = async (rules) => {
  //   console.log(rules);
  //   setNewRules([...rules,{"id": rules.length, "description": ""}]);
  //   console.log(rules)
  // };

  const addToUpdateRule = (id: any, description: Text) => {
    if (id && description) {
      rulesBeingEdited[id.toString()] = description;
    };
    console.log(rulesBeingEdited);

  }

  const createNewAddRuleField = (e) => {
    e.preventDefault();
    setNewRulesFieldArr(nfr => {
      return [
        ...nfr, { id: newRulesFieldArr.length + 1, description: "" }
      ];
    });
  }

  const handleChange = (e) => {
    e.preventDefault();
    const index = e.target.id;
    setNewRulesFieldArr(s => {
      const newArr = s.slice();
      newArr[index].description = e.target.value;

      return newArr;
    });
  };

  const onFormSubmit = async (values: any) => {
    console.log("onFormSubmit values", values);
    console.log("parent !!! onFormSubmit newRules", newRules);
    console.log("PRincipla", principalID);
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
          updateRulePromise.push(updateRule(rulesBeingEdited[principalID], Principal.fromText(principalID)));
        }
        await Promise.all(updateRulePromise);
        result = "Rules updated successfully";
      })
      .then(async () => {
        let updatedRules = await getProviderRules(
          Principal.fromText(principalID)
        );
        console.log(updatedRules);
        updateState(updatedRules);
        setNewRules(updatedRules);
      })
      .catch((e) => {
        console.log(e);
        result = e.message;
      });
    rulesBeingEdited = {};
    return result;
  };

  return (
    <FormModal title="Add Rules" toggle={toggle} handleSubmit={onFormSubmit} loader={loader} formStyle={{ maxHeight: '500px', overflow: 'auto' }}>
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
          {(idx == newRulesFieldArr.length - 1) ?
            (<span className="icon has-text-success ml-3">
              <span className="material-icons" onClick={createNewAddRuleField}>add_circle</span>
            </span>) : ("")}
        </div>
      ))}
    </FormModal>
  );
};

const EditModeratorSettingsModal = ({ toggle, principalID, settings, minVotes, minTokens, setMinVotes, setMinTokens }) => {
  console.log("settings", settings);
  // const [minVotes, setMinVotes] = useState(settings.minVotes ? parseInt(settings.minVotes) : 0);
  // const [minTokens, setMinTokens] = useState(settings.minStaked ? parseInt(settings.minStaked) : 0);
  const onFormSubmit = async (values: any) => {
    for (const k in values) {
      if (!isNaN(values[k] / 1)) {
        values[k] = values[k] / 1;
      }

    }
    values["minStaked"] = values.minTokens;
    console.log(values, typeof values.minTokens);
    // let values2 = {
    //   "minVotes": values.minTokens,
    //   "minStaked": values.minTokens
    // };
    //console.log("parent !!! onFormSubmit values", await updateProviderSettings(Principal.fromText(principalID), values2));
    await updateProviderSettings(Principal.fromText(principalID), values);
    setMinVotes(parseInt(values.minVotes));
    setMinTokens(parseInt(values.minTokens));
    console.log("test2");
    return "Moderator settings updated successfully";
  };
  console.log("SETTINGS", settings);
  return (
    <FormModal
      title="Edit Moderator Settings"
      toggle={toggle}
      handleSubmit={onFormSubmit}
    >
      <div className="field level">
        <p>Number of votes required to finalize decision:</p>
        <Field
          name="minVotes"
          component="input"
          className="input has-text-centered ml-3"
          initialValue={minVotes}
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

      {/* <div className="field level">
        <p>Example cost per each succesful vote (1% of stake):</p>
        <Field
          name="cost"
          component="input"
          type="number"
          className="input has-text-centered ml-3"
          initialValue={1}
          style={{ width: 70 }}
          readOnly={true}
        />
      </div>

      <div className="field level">
        <p>
          Number of your platform tokens to be distributed to the majority
          voters (optional):
        </p>
        <Field
          name="tokens"
          component="input"
          type="number"
          className="input has-text-centered ml-3"
          initialValue={5}
          style={{ width: 70 }}
          readOnly={true}
        />
      </div> */}
    </FormModal>
  );
};

const RemoveRuleModal = ({
  toggle,
  rule,
  principalID,
  updateState
}) => {
  const onRemoveRuleFormSubmit = async (values: any) => {
    //setLoader(true);
    //setNewRules(newRules.filter((item) => item !== rule));
    let result;
    console.log(values, rule, principalID)
    if (rule && rule.id) {
      await removeRules([rule.id], Principal.fromText(principalID))
        .then(async () => {
          let updatedRules = await getProviderRules(
            Principal.fromText(principalID)
          );
          console.log(updatedRules);
          updateState(updatedRules);
          result = "Rule Removed Successfully!"
        })
        .catch((e) => { console.log(e); result = e.message })
        .finally(() => console.log("removed"));
      return result;
    } else {
      result = "Error in removing rule. RuleID is not provided."
    }
  };

  return (
    <FormModal
      title="Remove rule"
      toggle={toggle}
      handleSubmit={onRemoveRuleFormSubmit}
    >
      <strong style={{"color":"#fff"}}>Are you really sure to remove following rule?</strong>
      <p style={{marginTop:8}}>"{rule.description}"</p>
    </FormModal>
  );
};

export default function Admin(args) {
  const [showEditApp, setShowEditApp] = useState(false);
  const toggleEditApp = () => setShowEditApp(!showEditApp);

  const [showEditRules, setShowEditRules] = useState(false);
  const toggleEditRules = () => setShowEditRules(!showEditRules);

  const [showRemoveRule, setShowRemoveRule] = useState(false);
  const [ruleToRemove, setRuleToRemove] = useState({});
  const toggleRemoveRule = (ruleToRemove) => {
    setShowRemoveRule(!showRemoveRule);
    setRuleToRemove(ruleToRemove);
  }


  const [showModeratorSettings, setShowModeratorSettings] = useState(false);
  const toggleModeratorSettings = () =>
    setShowModeratorSettings(!showModeratorSettings);

  const [rules, setRules] = useState([]);

  const [providers, setProviders] = useState([]);

  /* const [selectedProvider, setSelectedProvider] = useState(null); */

  const selectedProvider = args.selectedProvider;

  const [showModal, setShowModal] = useState(true);

  const [providerIdText, setProviderIdText] = useState("");

  const [minVotes, setMinVotes] = useState(0);
  const [minTokens, setMinTokens] = useState(0);
  /* if(selectedProvider){
    setMinVotes(selectedProvider.settings.minVotes ? parseInt(selectedProvider.settings.minVotes) : 0);
    setMinTokens(selectedProvider.settings.minStaked ? parseInt(selectedProvider.settings.minStaked) : 0);
    setRules(selectedProvider.rules);
  } */

  useEffect(() => {
    //console.log(0);
    let adminInit = () => {
      /* console.log(1);
      let adminProviders = await getAdminProviderIDs();
      console.log(adminProviders);
      console.log(2);
      let providerListPromise = [];
      for (let provider of adminProviders) {
        providerListPromise.push(getProvider(provider));
      }
      console.log(3);
      let providerList = await Promise.all(providerListPromise);
      console.log(4, providerList);
      setProviders(providerList);
      console.log(5);
      setProviderIdText(adminProviders[0].toText()); */
      console.log("minVotes", minVotes);

      if (selectedProvider) {
        setMinVotes(selectedProvider.settings.minVotes ? parseInt(selectedProvider.settings.minVotes) : 0);
        setMinTokens(selectedProvider.settings.minStaked ? parseInt(selectedProvider.settings.minStaked) : 0);
        setRules(selectedProvider.rules);
      }
      if (args.providerIdText) {
        console.log("providerIdTextFromDropDown", args.providerIdText);

        setProviderIdText(args.providerIdText);
      }
    };
    adminInit();
  }, []);
  const toggle = () => setShowModal(false);



  const [loader, setLoader] = useState(false);
  const [newRules, setNewRules] = useState(rules);
  return (
    <>
      {selectedProvider == null && providers != [] ? (
        <Modal show={showModal} onClose={toggle} showClose={true}>
          <Modal.Card backgroundColor="circles">
            <Modal.Card.Body>
              <Heading subtitle>Available Providers</Heading>
            </Modal.Card.Body>
            {providers.map((provider) => {
              return (
                <Button key={provider.id}
                  onClick={() => {
                    setSelectedProvider(provider);
                    setMinVotes(provider.settings.minVotes ? parseInt(provider.settings.minVotes) : 0);
                    setMinTokens(provider.settings.minStaked ? parseInt(provider.settings.minStaked) : 0);
                    console.log("test");
                    setShowModal(false);
                    setRules(provider.rules);
                  }}
                >
                  {provider.name}
                </Button>
              );
            })}
            <Modal.Card.Footer
              className="pt-0"
              justifyContent="flex-end"
            ></Modal.Card.Footer>
          </Modal.Card>
        </Modal>
      ) : (
        ""
      )}
      {selectedProvider != null &&
        <Columns>
          <Columns.Column tablet={{ size: 12 }} desktop={{ size: 8 }}>
            <Card className="is-fullheight">
              <Card.Content>
                <Media>
                  <Media.Item
                    renderAs="figure"
                    align="left"
                    style={{ marginRight: "1.5rem" }}
                  >
                    <Image
                      size={128}
                      src="http://bulma.io/images/placeholders/128x128.png"
                      className="has-gradient"
                    />
                  </Media.Item>
                  <Media.Item>
                    <table className="table is-label">
                      <tbody>
                        <tr>
                          <td>App Name:</td>
                          <td>
                            {!!selectedProvider ? selectedProvider.name : ""}
                          </td>
                        </tr>
                        <tr>
                          <td>Description:</td>
                          <td>
                            {!!selectedProvider
                              ? selectedProvider.description
                              : ""}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <Button color="dark" onClick={toggleEditApp}>
                      Edit App
                    </Button>
                  </Media.Item>
                </Media>
              </Card.Content>
            </Card>
          </Columns.Column>

          <Columns.Column tablet={{ size: 6 }} desktop={{ size: 4 }}>
            <Card className="is-fullheight">
              <Card.Content>
                <Heading subtitle>Stats</Heading>
                <table className="table is-striped has-text-left">
                  <tbody>
                    <tr>
                      <td>Total Feeds Posted</td>
                      <td>
                        {!!selectedProvider
                          ? selectedProvider.contentCount.toString()
                          : ""}
                      </td>
                    </tr>
                    <tr>
                      <td>Active Posts</td>
                      <td>
                        {!!selectedProvider
                          ? selectedProvider.activeCount.toString()
                          : ""}
                      </td>
                    </tr>
                    <tr>
                      <td>Rewards Spent</td>
                      <td>
                        {" "}
                        {!!selectedProvider
                          ? selectedProvider.rewardsSpent.toString()
                          : ""}
                      </td>
                    </tr>
                    <tr>
                      <td>Avg. Stakes</td>
                      <td>100</td>
                    </tr>
                    <tr>
                      <td>Humans Verified</td>
                      <td>3434</td>
                    </tr>
                  </tbody>
                </table>
              </Card.Content>
            </Card>
          </Columns.Column>

          <Columns.Column tablet={{ size: 6 }} desktop={{ size: 4 }}>
            <Card backgroundColor="circles" className="is-fullheight">
              <Card.Content>
                <Heading className="mb-2">Token Reserve</Heading>
                <p>The tokens used to found moderators.</p>
              </Card.Content>
            </Card>
          </Columns.Column>

          <Columns.Column tablet={{ size: 6 }} desktop={{ size: 4 }}>
            <Card backgroundColor="circles" className="is-fullheight">
              <Card.Content className="is-flex is-align-items-center pb-0">
                <img src={walletImg} />
                <div
                  className="mt-3 ml-3"
                  style={{ whiteSpace: "nowrap", lineHeight: 0.5 }}
                >
                  <p className="is-size-7 has-text-light">min 100000 tokens</p>
                  <Heading size={1} className="level">
                    <span>55k</span>
                    <span className="is-size-6 has-text-light has-text-weight-normal ml-3">
                      MOD
                      <br />
                      tokens
                    </span>
                  </Heading>
                </div>
              </Card.Content>
              <Card.Footer style={{ border: 0 }}>
                <Button.Group>
                  <Button color="dark" fullwidth>
                    Buy
                  </Button>
                  <Button color="dark" fullwidth>
                    Deposit
                  </Button>
                </Button.Group>
              </Card.Footer>
            </Card>
          </Columns.Column>

          <Columns.Column tablet={{ size: 6 }} desktop={{ size: 4 }}>
            <Card backgroundColor="circles" className="is-fullheight">
              <Card.Content className="is-flex is-align-items-center pb-0">
                <img src={stakedImg} />
                <div
                  className="mt-3 ml-3"
                  style={{ whiteSpace: "nowrap", lineHeight: 0.5 }}
                >
                  <Heading size={1} className="level">
                    <span>5</span>
                    <span className="is-size-6 has-text-light has-text-weight-normal ml-3">
                      DSCVR
                      <br />
                      tokens
                    </span>
                  </Heading>
                </div>
              </Card.Content>
              <Card.Footer style={{ border: 0 }}>
                <Button color="dark" style={{ width: "50%" }}>
                  Deposit
                </Button>
              </Card.Footer>
            </Card>
          </Columns.Column>

          <Columns.Column tablet={{ size: 12 }} desktop={{ size: 6 }}>
            <Card className="is-fullheight">
              <Card.Header>
                <Card.Header.Title textSize={5}>Rules</Card.Header.Title>
                <Button color="dark" onClick={toggleEditRules}>
                  Add Rules
                </Button>
              </Card.Header>
              <Card.Content>
                <table className="table is-striped has-text-left">
                  <tbody>
                    {rules.map((rule) => (
                      <tr key={rule.id}>
                        <td className="has-text-left">{rule.description}</td>
                        <td className="has-text-left">
                          <span
                            className="icon has-text-danger is-clickable ml-3"
                            onClick={() => toggleRemoveRule(rule)}
                          >
                            {loader ? (<span className="is-loading button"></span>) : (<span className="material-icons">remove_circle</span>)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card.Content>
            </Card>
          </Columns.Column>

          <Columns.Column tablet={{ size: 12 }} desktop={{ size: 6 }}>
            <Card className="is-fullheight">
              <Card.Header>
                <Card.Header.Title textSize={5}>
                  Moderator Settings
                </Card.Header.Title>
                <Button color="dark" onClick={toggleModeratorSettings}>
                  Edit Settings
                </Button>
              </Card.Header>
              <Card.Content>
                <table className="table is-striped has-text-left">
                  <tbody>
                    <tr>
                      <td>Number of votes required to finalize decision:</td>
                      <td className="has-text-white is-size-5 has-text-weight-bold">
                        {/* {selectedProvider
                          ? selectedProvider.settings.minVotes.toString()
                          : 0} */}
                        {minVotes.toString()}
                      </td>
                    </tr>
                    <tr>
                      <td>Required number of staked MOD tokens to vote:</td>
                      <td className="has-text-white is-size-5 has-text-weight-bold">
                        {/* {selectedProvider
                          ? selectedProvider.settings.minStaked.toString()
                          : 0} */}
                        {minTokens.toString()}
                      </td>
                    </tr>
                    {/* <tr>
                      <td>Example cost per each successful vote (1% of stake)</td>
                      <td className="has-text-white is-size-5 has-text-weight-bold">
                        1
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Number of your platform tokens to be distributed to the
                        majority voters (optional)
                      </td>
                      <td className="has-text-white is-size-5 has-text-weight-bold">
                        100
                      </td>
                    </tr> */}
                  </tbody>
                </table>
              </Card.Content>
            </Card>
          </Columns.Column>
        </Columns>
      }

      <TrustedIdentities provider={providerIdText} selectedProvider={selectedProvider} />

      {showEditApp && <EditAppModal toggle={toggleEditApp} selectedProvider={selectedProvider} />}

      {showEditRules && (
        <EditRulesModal
          rules={rules}
          toggle={toggleEditRules}
          principalID={providerIdText}
          updateState={setRules}
        />
      )}
      {showModeratorSettings && (
        <EditModeratorSettingsModal
          toggle={toggleModeratorSettings}
          principalID={providerIdText}
          settings={selectedProvider.settings}
          minVotes={minVotes}
          minTokens={minTokens}
          setMinVotes={setMinVotes}
          setMinTokens={setMinTokens}
        />
      )}

      {showRemoveRule && (
        <RemoveRuleModal
          toggle={toggleRemoveRule}
          rule={ruleToRemove}
          principalID={providerIdText}
          updateState={setRules}
        />
      )}
    </>
  );
}

/*  await removeRules([rule], Principal.fromText(principalID))
       .then(async () => {
         let updatedRules = await getProviderRules(
           Principal.fromText(principalID)
         );
         console.log(updatedRules);
         setRules(updatedRules);
         setNewRules(updatedRules);
       })
       .catch((e) => console.log(e))
       .finally(() => setLoader(false)); */

