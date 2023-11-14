import * as React from "react";
import { useEffect, useState, useContext } from "react";
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
import stakedImg from "../../../../../assets/staked.svg";
import EditProviderLogo from "./EditProviderLogo";
import EditRulesModal from "./EditRulesModal";
import RemoveRuleModal from "./RemoveRuleModal";
import EditAppModal from "./EditAppModal";
import { convert_to_mod, getUrlFromArray } from "../../../../utils/util";
import Deposit from "../../../app/modals/Deposit";
import { useActors } from "../../../../hooks/actors";
import {
  useAppState,
  useAppStateDispatch,
} from "../../../app/state_mgmt/context/state";

export default function Admin() {
  const { modclub } = useActors();
  const { client } = useContext(Connect2ICContext);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const providerIdText = "";

  const [showEditApp, setShowEditApp] = useState(false);
  const toggleEditApp = () => setShowEditApp(!showEditApp);
  const appState = useAppState();

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
  const [showModal, setShowModal] = useState(true);
  const [imageUploadedMsg, setImageUploadedMsg] = useState(null);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [loader, setLoader] = useState(false);
  const [providerSubAcc, setProviderSubAcc] = useState(null);
  const [modclubCanId, setModclubCanId] = useState("MODCLUB_CANISTER_ID");

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
      sub_acc_rec.length &&
        setProviderSubAcc(new TextDecoder().decode(sub_acc_rec[1]));
    }
  }, [appState.selectedProvider]);

  useEffect(() => {
    if (client._service?._state?.context?.canisters?.modclub) {
      setModclubCanId(
        client._service?._state?.context?.canisters?.modclub.canisterId
      );
    }
  }, [client._service?._state]);

  const toggle = () => setShowModal(false);

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
                    <table className="table is-label">
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
                <Link to="/provider/admin/activity/" className="button ml-6">
                  See Recent Activity
                </Link>
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
                  <Heading size={1} className="level">
                    <span>
                      {convert_to_mod(
                        appState.providerBalance,
                        BigInt(appState.decimals),
                        2
                      )}
                    </span>
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
                  <Button color="dark" fullwidth onClick={toggleDeposit}>
                    Deposit
                  </Button>
                </Button.Group>
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
        <Deposit
          toggle={toggleDeposit}
          provider={appState.selectedProvider.id.toString()}
          isProvider={true}
        />
      )}
    </>
  );
}
