import React, { useEffect, useState, useContext } from "react";
import { Principal } from "@dfinity/principal";
import {
  Columns,
  Card,
  Button,
  Heading,
  Modal,
  Media,
  Notification,
} from "react-bulma-components";
import { Link } from "react-router-dom";
import { Connect2ICContext } from "@connect2icmodclub/react";

import TrustedIdentities from "./TrustedIdentities";
import walletImg from "../../../../../assets/wallet.svg";
import EditProviderLogo from "./EditProviderLogo";
import EditRulesModal from "./EditRulesModal";
import RemoveRuleModal from "./RemoveRuleModal";
import EditAppModal from "./EditAppModal";
import { convert_to_mod, getUrlFromArray } from "../../../../utils/util";
import {
  useAppState,
  useAppStateDispatch,
} from "../../../app/state_mgmt/context/state";
import ProviderDepositPopup from "./ProviderDepositPopup";

export default function Admin() {
  const { client } = useContext(Connect2ICContext);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const providerIdText = "";

  const [showEditApp, setShowEditApp] = useState(false);
  const toggleEditApp = () => setShowEditApp(!showEditApp);
  const appState = useAppState();
  const dispatch = useAppStateDispatch();

  const [showEditRules, setShowEditRules] = useState(false);
  const toggleEditRules = () => setShowEditRules(!showEditRules);

  const [showRemoveRule, setShowRemoveRule] = useState(false);
  const [ruleToRemove, setRuleToRemove] = useState({});
  const toggleRemoveRule = (ruleToRemove) => {
    setShowRemoveRule(!showRemoveRule);
    setRuleToRemove(ruleToRemove);
  };
  const [rules, setRules] = useState([]);

  const imgMetaData = appState.selectedProvider?.image[0];
  if (imgMetaData) {
    appState.selectedProvider.image[0].src = getUrlFromArray(
      imgMetaData.data,
      imgMetaData.imageType
    );
  }
  const [showModal, setShowModal] = useState<boolean>(true);
  const [imageUploadedMsg, setImageUploadedMsg] = useState(null);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [loader, setLoader] = useState(false);
  const [providerSubAcc, setProviderSubAcc] = useState(null);
  const [providerBufferSubAcc, setProviderBufferSubAcc] = useState(null);
  const [modclubCanId, setModclubCanId] = useState("MODCLUB_CANISTER_ID");

  const providerBalance = convert_to_mod(
    appState.providerBalance,
    BigInt(appState.decimals),
    2
  );

  const providerBufferBalance = convert_to_mod(
    appState.providerBufferBalance,
    BigInt(appState.decimals),
    2
  );

  const toggleDeposit = () => {
    setIsDepositOpen(!isDepositOpen);
  };

  const updateProvider = () => {
    providers.map((prvd) => {
      if (prvd.id.toString() == appState.selectedProvider.id.toString()) {
        prvd = appState.selectedProvider;
      }
    });
  };

  useEffect(() => {
    if (appState.selectedProvider) {
      setRules(appState.selectedProvider.rules);
      const sub_acc_rec = appState.selectedProvider.subaccounts.find(
        (item) => item[0] === "RESERVE"
      );
      const buffer_acc_rec = appState.selectedProvider.subaccounts.find(
        (item) => item[0] === "ACCOUNT_PAYABLE"
      );
      if (sub_acc_rec && sub_acc_rec.length > 1) {
        const sub_acc_blob = new Uint8Array(sub_acc_rec[1]);
        setProviderSubAcc(new TextDecoder().decode(sub_acc_blob));
      }
      if (buffer_acc_rec && sub_acc_rec.length > 1) {
        const buffer_sa_blob = new Uint8Array(buffer_acc_rec[1]);
        setProviderBufferSubAcc(new TextDecoder().decode(buffer_sa_blob));
      }
    }
  }, [appState.selectedProvider]);

  useEffect(() => {
    if (client._service?._state?.context?.canisters?.modclub) {
      setModclubCanId(
        client._service?._state?.context?.canisters?.modclub.canisterId
      );
    }
  }, [client._service?._state]);

  const closeModalHandler = () => {
    setShowModal(!showModal);
  };

  return (
    <>
      {appState.selectedProvider == null && providers.length != 0 ? (
        <Modal show={showModal} onClose={toggle} showClose={true}>
          <Modal.Card backgroundColor="circles">
            <Modal.Card.Body>
              <Heading subtitle>Available Providers</Heading>
            </Modal.Card.Body>
            {providers.map((provider) => {
              return (
                <Button
                  key={provider.id}
                  onClick={() => {
                    setSelectedProvider(provider);
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
      {imageUploadedMsg && (
        <Notification
          color={imageUploadedMsg.success ? "success" : "danger"}
          className="has-text-centered"
        >
          {imageUploadedMsg.value}
        </Notification>
      )}
      {appState.selectedProvider != null && (
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
                    <EditProviderLogo
                      principalID={providerIdText}
                      selectedProvider={appState.selectedProvider}
                      setImageUploadedMsg={setImageUploadedMsg}
                    />
                  </Media.Item>
                  <Media.Item>
                    <table className="table is-label adminInfo">
                      <tbody>
                        <tr>
                          <td>App Name:</td>
                          <td> {appState.selectedProvider?.name} </td>
                        </tr>
                        <tr>
                          <td>Description:</td>
                          <td> {appState.selectedProvider?.description} </td>
                        </tr>
                        <tr>
                          <td>ICRC1 Account:</td>
                          <td>
                            {" "}
                            {`record { owner = principal "${modclubCanId}"; subaccount = opt blob "${providerSubAcc}" }`}{" "}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <Button color="darkGreen" onClick={toggleEditApp}>
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
                        {appState.selectedProvider?.contentCount?.toString() ||
                          "0"}
                      </td>
                    </tr>
                    <tr>
                      <td>Content in Review</td>
                      <td>
                        {appState.selectedProvider?.activeCount?.toString() ||
                          "0"}
                      </td>
                    </tr>
                    <tr>
                      <td>Content Reviewed</td>
                      <td>
                        {!!appState.selectedProvider
                          ? (
                              appState.selectedProvider.contentCount -
                              appState.selectedProvider.activeCount
                            ).toString()
                          : "0"}
                      </td>
                    </tr>
                    {/* <tr>
                      <td>Humans Verified</td>
                      <td>3434</td>
                    </tr> */}
                  </tbody>
                </table>
                <Link to="/provider/admin/activity/" className="is-linear is-fullwidth button">
                  See Recent Activity
                </Link>
              </Card.Content>
            </Card>
          </Columns.Column>

          <Columns.Column tablet={{ size: 6 }} desktop={{ size: 6 }}>
            <Card backgroundColor="circles" className="is-fullheight">
              <Card.Content className="is-flex is-align-items-center pb-0">
                <img src={walletImg} />
                <div
                  className="mt-3 ml-3"
                  style={{ whiteSpace: "nowrap", lineHeight: 0.5 }}
                >
                  <Heading size={1} className="level">
                    <span>{providerBalance}</span>
                    <span className="is-size-6 has-text-light has-text-weight-normal ml-3">
                      DCD
                      <br />
                      tokens
                    </span>
                    <br/>
                    <span style={{marginLeft: "0.75rem", fontWeight: 300, fontSize: "24px"}} >Lock:{providerBufferBalance}</span>
                    <span className="is-size-6 has-text-light has-text-weight-normal ml-3">
                      DCD
                      <br />
                      tokens
                    </span>
                  </Heading>
                </div>
              </Card.Content>
              <Card.Footer style={{ border: 0 }}>
                <Button.Group>
                  <Button color="darkGreen" fullwidth onClick={toggleDeposit}>
                    Deposit
                  </Button>
                </Button.Group>
              </Card.Footer>
            </Card>
          </Columns.Column>

          <Columns.Column tablet={{ size: 12 }} desktop={{ size: 6 }}>
            <Card className="is-fullheight">
              <Card.Header className="is-justify-content-space-between">
                <Heading subtitle marginless>Rules</Heading>
                <Button.Group className="is-hidden-mobile">
                  <Button color="darkGreen" onClick={toggleEditRules}>
                    Add Rules
                  </Button>
                </Button.Group>
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
                            {loader ? (
                              <span className="is-loading button"></span>
                            ) : (
                              <span className="material-icons">
                                remove_circle
                              </span>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card.Content>
            </Card>
          </Columns.Column>
        </Columns>
      )}

      <TrustedIdentities
        provider={providerIdText}
        selectedProvider={appState.selectedProvider}
      />

      {showEditApp && <EditAppModal toggle={toggleEditApp} />}

      {showEditRules && (
        <EditRulesModal
          rules={rules}
          toggle={toggleEditRules}
          updateState={setRules}
        />
      )}

      {showRemoveRule && (
        <RemoveRuleModal toggle={toggleRemoveRule} rule={ruleToRemove} />
      )}
      {isDepositOpen && appState.selectedProvider && (
        <ProviderDepositPopup toggle={toggleDeposit} show={isDepositOpen} />
      )}
    </>
  );
}
