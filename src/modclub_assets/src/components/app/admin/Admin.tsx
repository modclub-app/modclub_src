import * as React from "react";
import { Field } from "react-final-form";
import { useEffect, useRef, useState } from "react";

import {
  Columns,
  Card,
  Button,
  Heading,
  Modal,
  Media,
  Image,
  Notification,
  Icon,
} from "react-bulma-components";
import { Link } from "react-router-dom";
import FormModal from "../modals/FormModal";
import {
  addRules,
  updateRule,
  removeRules,
  getProviderRules,
  getProvider,
  updateProviderSettings,
  updateProviderMetaData,
  getUserFromCanister,
  getAdminProviderIDs,
  updateProviderLogo,
} from "../../../utils/api";
import TrustedIdentities from "./TrustedIdentities";
import walletImg from "../../../../assets/wallet.svg";
import stakedImg from "../../../../assets/staked.svg";
import placeholder from "../../../../assets/user_placeholder.png";
import { ImageData } from "../../../utils/types";
import { Principal } from "@dfinity/principal";
import AdminIdentity from "../../external/AdminIdentity";

const EditAppModal = ({ toggle, principalID, selectedProvider, providers }) => {
  const onFormSubmit = async (values: any) => {
    await updateProviderMetaData(Principal.fromText(principalID), values);
    selectedProvider.name = values.name;
    selectedProvider.description = values.description;
    providers.map(prvd => {
      if(prvd.id === selectedProvider.id || prvd.id.toString() ==  selectedProvider.id.toString()){
        prvd = selectedProvider;
      }
    });
    return "App Edited Successfully";
  };

  return (
    <FormModal title="Edit App" toggle={toggle} handleSubmit={onFormSubmit}>
      <div className="field" style={{marginTop:"10px"}}>
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

const getUrlFromArray = (imgData,imgType):string => {
  const arrayBufferView = new Uint8Array(imgData);
  const blob = new Blob([arrayBufferView], { type: imgType });
  const urlCreator = window.URL || window.webkitURL;
  const imageUrl = urlCreator.createObjectURL(blob);
  return imageUrl;
}

const EditProviderLogo = ({ principalID, selectedProvider, setImageUploadedMsg }) =>{
  const inputFile = useRef(null);
  const [logoBeingUploaded, setLogoBeingUploaded] = useState<boolean>(false);
  const [logoPicSrc, setLogoPicSrc] = useState("");
  const handleUploadProviderLogo = async (e) => {
    const files  = e.target.files;
    if (files.length > 0) {
      const flToUpload = files[0];
      const reader = new FileReader();//.readAsArrayBuffer();
      let imageData:ImageData;
      reader.onload = async (evt) => {
        const data = typeof evt.target.result == "string" ? evt.target.result : null;
        const buffer = await flToUpload.arrayBuffer();
        imageData = {
          src: data,
          picUInt8Arr:Array.from(new Uint8Array(buffer)),
          type: flToUpload.type,
        };

        try {
          setLogoBeingUploaded(true);
          await updateProviderLogo(Principal.fromText(principalID), imageData);
          const imgSrcFromImgData = getUrlFromArray(imageData.picUInt8Arr,imageData.type);
          const updatedImg = [{
            data:imageData.picUInt8Arr,
            imageType:imageData.type,
            src: imgSrcFromImgData
          }];
          setLogoPicSrc(imgSrcFromImgData);
          selectedProvider.image = updatedImg;
          setImageUploadedMsg({ success: true, value: "Logo uploaded Successfully!" });
        } catch (e) {
          setImageUploadedMsg({ success: false, value: "Error in uploading logo. Try again." });
        }
        setLogoBeingUploaded(false);
        setTimeout(() => setImageUploadedMsg(), 3000);
      };
      reader.readAsDataURL(flToUpload);
    }
  };

  return (
    <>
      <input
        style={{ display: "none" }}
        ref={inputFile}
        onChange={(e)=>handleUploadProviderLogo(e)}
        accept="image/*"
        type="file"
      />
      <Media
        justifyContent="center"
        onClick={() => inputFile.current.click()}
      >
        <Image
          src={logoPicSrc ? logoPicSrc : (selectedProvider.image[0]?.src ? selectedProvider.image[0].src : placeholder)}
          alt="profile"
          size={128}
          className="is-clickable is-hover-reduced"
          style={{ overflow: "hidden", opacity:logoBeingUploaded?0.2:1}}
        />
        {logoBeingUploaded?
          (<div className="loader is-loading" style={{position: 'absolute',top: '50%'}}></div>):
          !selectedProvider.image[0]?.src && (
          <div
            style={{
              position: "absolute",
              backgroundColor: "rgba(0, 0, 0, .5)",
              width: 128,
              height: 128,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <Icon color="white">
              <span className="material-icons">backup</span>
            </Icon>
            <p>Click to add Logo</p>
          </div>
        )}
      </Media>
    </>
  )
}

const EditRulesModal = ({ rules, toggle, principalID, updateState }) => {
  const [newRules, setNewRules] = useState(rules);
  const [loader, setLoader] = useState(false);
  let rulesBeingEdited = {};

  let addNewRuleField = [{ id: 1, description: "" }];
  const [newRulesFieldArr, setNewRulesFieldArr] = useState(addNewRuleField);

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
  const onFormSubmit = async (values: any) => {
    for (const k in values) {
      if (!isNaN(values[k] / 1)) {
        values[k] = values[k] / 1;
      }

    }
    values["minStaked"] = values.minTokens;

    await updateProviderSettings(Principal.fromText(principalID), values);
    setMinVotes(parseInt(values.minVotes));
    setMinTokens(parseInt(values.minTokens));

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
    let result;

    if (rule && rule.id) {
      await removeRules([rule.id], Principal.fromText(principalID))
        .then(async () => {
          let updatedRules = await getProviderRules(
            Principal.fromText(principalID)
          );
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

export default function Admin({selectedProvider,providerIdText,setSelectedProvider, providers}) {
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

  const imgMetaData = selectedProvider.image[0];
  if(imgMetaData){
    selectedProvider.image[0].src = getUrlFromArray(imgMetaData.data,imgMetaData.imageType);
  }
  const [showModal, setShowModal] = useState(true);

  const [minVotes, setMinVotes] = useState(0);
  const [minTokens, setMinTokens] = useState(0);

  const [imageUploadedMsg, setImageUploadedMsg] = useState(null);

  useEffect(() => {
    let adminInit = () => {
      if (selectedProvider) {
        setMinVotes(selectedProvider.settings.minVotes ? parseInt(selectedProvider.settings.minVotes) : 0);
        setMinTokens(selectedProvider.settings.minStaked ? parseInt(selectedProvider.settings.minStaked) : 0);
        setRules(selectedProvider.rules);
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
      {imageUploadedMsg &&
        <Notification color={imageUploadedMsg.success ? "success" : "danger"} className="has-text-centered">
          {imageUploadedMsg.value}
        </Notification>
      }
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
                    <EditProviderLogo principalID={providerIdText} selectedProvider={selectedProvider} setImageUploadedMsg={setImageUploadedMsg}/>
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
                      <td>Total Content Submitted</td>
                      <td>
                        {!!selectedProvider
                          ? selectedProvider.contentCount.toString()
                          : "0"}
                      </td>
                    </tr>
                    <tr>
                      <td>Content in Review</td>
                      <td>
                        {!!selectedProvider
                          ? selectedProvider.activeCount.toString()
                          : "0"}
                      </td>
                    </tr>
                    <tr>
                      <td>Content Reviewed</td>
                      <td>
                        {!!selectedProvider
                          ? (selectedProvider.contentCount - selectedProvider.activeCount).toString()
                          : "0"}
                      </td>
                    </tr> 
                    {/* <tr>
                      <td>Humans Verified</td>
                      <td>3434</td>
                    </tr> */}
                  </tbody>
                </table>
                <Link to="/app/admin/activity/" className="button ml-6" >
                      See Recent Activity
                </Link>
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
                        {minVotes.toString()}
                      </td>
                    </tr>
                    <tr>
                      <td>Required number of staked MOD tokens to vote:</td>
                      <td className="has-text-white is-size-5 has-text-weight-bold">
                        {minTokens.toString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Card.Content>
            </Card>
          </Columns.Column>
        </Columns>
      }

      <TrustedIdentities provider={providerIdText} selectedProvider={selectedProvider} />

      {showEditApp && <EditAppModal toggle={toggleEditApp} principalID={providerIdText} selectedProvider={selectedProvider} providers={providers}/>}

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

