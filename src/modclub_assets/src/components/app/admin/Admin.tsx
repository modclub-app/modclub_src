import * as React from "react";
import { useEffect, useState } from "react";
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
import {
  icrc1Balance,
  icrc1Decimal,
  providerSaBalanceById,
} from "../../../utils/api";
import TrustedIdentities from "./TrustedIdentities";
import walletImg from "../../../../assets/wallet.svg";
import stakedImg from "../../../../assets/staked.svg";
import { useAuth } from "../../../utils/auth";
import EditProviderLogo from "./EditProviderLogo";
import EditRulesModal from "./EditRulesModal";
import EditModeratorSettingsModal from "./EditModeratorSettingsModal";
import RemoveRuleModal from "./RemoveRuleModal";
import EditAppModal from "./EditAppModal";
import { format_token, getUrlFromArray } from "../../../utils/util";
import Deposit from "../modals/Deposit";

export default function Admin({
  selectedProvider,
  providerIdText,
  setSelectedProvider,
  providers,
}) {
  const { identity } = useAuth();
  const [showEditApp, setShowEditApp] = useState(false);
  const toggleEditApp = () => setShowEditApp(!showEditApp);
  const [providerTokenBalance, setProviderTokenBalance] = useState<number>(0);
  const [userTokenBalance, setUserTokenBalance] = useState<number>(0);
  const [digit, setDigit] = useState<number>(0);

  const [showEditRules, setShowEditRules] = useState(false);
  const toggleEditRules = () => setShowEditRules(!showEditRules);

  const [showRemoveRule, setShowRemoveRule] = useState(false);
  const [ruleToRemove, setRuleToRemove] = useState({});
  const toggleRemoveRule = (ruleToRemove) => {
    setShowRemoveRule(!showRemoveRule);
    setRuleToRemove(ruleToRemove);
  };

  const [showModeratorSettings, setShowModeratorSettings] = useState(false);
  const toggleModeratorSettings = () =>
    setShowModeratorSettings(!showModeratorSettings);

  const [rules, setRules] = useState([]);

  const imgMetaData = selectedProvider.image[0];
  if (imgMetaData) {
    selectedProvider.image[0].src = getUrlFromArray(
      imgMetaData.data,
      imgMetaData.imageType
    );
  }
  const [showModal, setShowModal] = useState(true);
  const [requiredVotes, setrequiredVotes] = useState(0);
  const [minTokens, setMinTokens] = useState(0);
  const [imageUploadedMsg, setImageUploadedMsg] = useState(null);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [loader, setLoader] = useState(false);
  const toggleDeposit = () => {setIsDepositOpen(!isDepositOpen); get_token();};

  const updateProvider = () => {
    providers.map((prvd) => {
      if (
        prvd.id === selectedProvider.id ||
        prvd.id.toString() == selectedProvider.id.toString()
      ) {
        prvd = selectedProvider;
      }
    });
  };
  let get_token = async () => {
    let [token, amount, digits] = await Promise.all([
      providerSaBalanceById(selectedProvider.id),
      icrc1Balance(identity.getPrincipal().toText()),
      icrc1Decimal()
    ]);
    setDigit(Number(digits))
    setProviderTokenBalance(Number(token));
    setUserTokenBalance(Number(amount)/Math.pow(10, Number(digits)));

  };

  useEffect(() => {
    get_token();
    let adminInit = () => {
      if (selectedProvider) {
        setrequiredVotes(
          selectedProvider.settings.requiredVotes
            ? parseInt(selectedProvider.settings.requiredVotes)
            : 0
        );
        setMinTokens(
          selectedProvider.settings.minStaked
            ? parseInt(selectedProvider.settings.minStaked)
            : 0
        );
        setRules(selectedProvider.rules);
      }
    };
    adminInit();    
  }, []);

  const toggle = () => setShowModal(false);
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
                <Button
                  key={provider.id}
                  onClick={() => {
                    setSelectedProvider(provider);
                    setrequiredVotes(
                      provider.settings.requiredVotes
                        ? parseInt(provider.settings.requiredVotes)
                        : 0
                    );
                    setMinTokens(
                      provider.settings.minStaked
                        ? parseInt(provider.settings.minStaked)
                        : 0
                    );
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
      {selectedProvider != null && (
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
                      selectedProvider={selectedProvider}
                      setImageUploadedMsg={setImageUploadedMsg}
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
                          ? (
                              selectedProvider.contentCount -
                              selectedProvider.activeCount
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
                <Link to="/app/admin/activity/" className="button ml-6">
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
                  <Heading size={1} className="level">
                    <span>{format_token(providerTokenBalance/Math.pow(10, digit))}</span>
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
                  <Button color="dark" fullwidth onClick={toggleDeposit}>
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
                        {requiredVotes.toString()}
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
      )}

      <TrustedIdentities
        provider={providerIdText}
        selectedProvider={selectedProvider}
      />

      {showEditApp && (
        <EditAppModal
          toggle={toggleEditApp}
          principalID={providerIdText}
          selectedProvider={selectedProvider}
          updateProvider={updateProvider}
        />
      )}

      {showEditRules && (
        <EditRulesModal
          rules={rules}
          toggle={toggleEditRules}
          principalID={providerIdText}
          updateState={setRules}
          selectedProvider={selectedProvider}
          updateProvider={updateProvider}
        />
      )}
      {showModeratorSettings && (
        <EditModeratorSettingsModal
          toggle={toggleModeratorSettings}
          principalID={providerIdText}
          selectedProvider={selectedProvider}
          requiredVotes={requiredVotes}
          minTokens={minTokens}
          setrequiredVotes={setrequiredVotes}
          setMinTokens={setMinTokens}
          updateProvider={updateProvider}
        />
      )}

      {showRemoveRule && (
        <RemoveRuleModal
          toggle={toggleRemoveRule}
          rule={ruleToRemove}
          principalID={providerIdText}
          updateState={setRules}
          selectedProvider={selectedProvider}
          updateProvider={updateProvider}
        />
      )}
      {isDepositOpen && selectedProvider &&(
        <Deposit 
        toggle={toggleDeposit}
        userTokenBalance={userTokenBalance}
        identity={identity}
        provider={selectedProvider.id.toString()}
        />
      )
      }
    </>
  );
}
