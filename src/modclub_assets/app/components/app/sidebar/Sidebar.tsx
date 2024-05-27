import * as React from "react";
import { Link } from "react-router-dom";
import {
  Columns,
  Menu,
  Image,
  Heading,
  Icon,
  Button,
  Modal,
  Dropdown,
  Notification,
} from "react-bulma-components";
import LogoImg from "../../../../assets/full_logo_black.svg";
import SidebarUser from "./SidebarUser";
import { useConnect } from "@connect2icmodclub/react";
import { Principal } from "@dfinity/principal";
import { useProfile } from "../../../contexts/profile";
import { SignIn } from "../../auth/SignIn";
import { useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
import ToggleSwitch from "../../common/toggleSwitch/toggle-switch";
import logger from "../../../utils/logger";
import { useActors } from "../../../hooks/actors";
import { useAppState, useAppStateDispatch } from "../state_mgmt/context/state";

import { SidebarMenuList } from './SidebarMenuList';

const InviteModerator = ({ toggle }) => {
  const link = "Coming Soon"; //`${window.location.origin}/referral=${Date.now()}`

  return (
    <Modal show={true} onClose={toggle} closeOnBlur={true} showClose={false}>
      <Modal.Card backgroundColor="circles" className="is-small">
        <Modal.Card.Body>
          <Heading subtitle>Invite a Moderator</Heading>
          <p>
            Invite moderators to earn MOD tokens. For every invited moderator
            that registers with MODCLUB, you will earn{" "}
            <span className="has-text-weight-bold">5 mod tokens</span>
          </p>

          <div className="field mt-6">
            <label className="label has-text-white">Referral Link:</label>
            <div className="control has-icons-right">
              <input
                className="input"
                placeholder={link}
                style={{ zIndex: -1 }}
              />
              <Icon
                align="right"
                color="white"
                className="is-clickable"
                onClick={() => {
                  navigator.clipboard.writeText(link);
                }}
              >
                <span className="material-icons">file_copy</span>
              </Icon>
            </div>
          </div>
        </Modal.Card.Body>
        <Modal.Card.Footer justifyContent="flex-end" className="pt-0">
          <Button.Group>
            <Button color="primary" onClick={toggle}>
              Close
            </Button>
          </Button.Group>
        </Modal.Card.Footer>
      </Modal.Card>
    </Modal>
  );
};

const DropdownLabel = ({ toggle }) => {
  return (
    <>
      <Icon style={{ marginLeft: "3px" }}>
        <span className="material-icons">assignment_ind</span>
      </Icon>
      <div className="is-flex" onClick={toggle}>
        <div className="ml-4 is-flex is-flex-direction-column is-justify-content-center has-text-left">
          <Heading size={6}>Switch to Provider Dashboard</Heading>
        </div>
      </div>
    </>
  );
};

export default function Sidebar() {
  const history = useHistory();
  const { isConnected, activeProvider, principal } = useConnect();
  const appState = useAppState();

  const {
    providers,
    userAlertVal,
    setUserAlertVal,
    selectedProvider,
    setSelectedProvider,
  } = useProfile();
  const { rs, modclub } = useActors();
  const [showModal, setShowModal] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState(null);
  const toggleModal = () => setShowModal(!showModal);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadSpinner, setLoadSpinner] = useState(false);
  const [level, setLevel] = useState("");
  const toggle = () => setShowDropdown(!showDropdown);

  const subscribeToAlert = async () => {
    setLoadSpinner(true);
    if (userAlertVal) {
      await modclub.registerUserToReceiveAlerts(
        Principal.fromText(principal),
        false
      );
      setUserAlertVal(false);
      setLoadSpinner(false);
      return;
    }
    const email = appState.userProfile.email;
    if (!email)
      setNotificationMsg({
        success: false,
        value: "Email Id is not provided!!",
      });
    const msgToDisplay = {
      success: true,
      value: "Please check your email to receive email alerts!!",
    };
    try {
      const envToUse =
        process.env.DFX_NETWORK == "local"
          ? "dev"
          : process.env.DEV_ENV
          ? process.env.DEV_ENV
          : "dev";

      await modclub.sendVerificationEmail(envToUse);
    } catch (error) {
      logger.error("Error occurred while sending email", error);
      msgToDisplay.success = false;
      msgToDisplay.value =
        "Error occurred while sending email. Please try again later.";
    }
    setLoadSpinner(false);
    setNotificationMsg(msgToDisplay);
    setTimeout(() => {
      setNotificationMsg(null);
    }, 5000);
  };

  const fetchUserAlertOptinVal = async () => {
    setLoadSpinner(true);
    try {
      const result = await modclub.checkIfUserOptToReciveAlerts();
      setUserAlertVal(result);
    } catch (error) {
      logger.error("fetchUserAlertOptinVal", error);
      setUserAlertVal(false);
    }

    setLoadSpinner(false);
  };

  useEffect(() => {
    let isMounted = true;
    if (isConnected && !appState.userProfile && appState.requiresSignUp) {
      history.push("/signup");
    }
    if (isConnected && appState.userProfile) {
      fetchUserAlertOptinVal();
    }
    const getUserLv = async () => {
      if (rs) {
        const res = await rs.queryRSAndLevelByPrincipal(
          Principal.fromText(principal)
        );
        if (
          res &&
          res.level &&
          Object.keys(res.level).length > 0 &&
          isMounted
        ) {
          setLevel(Object.keys(res.level)[0]);
        }
      }
    };
    principal && getUserLv();
    return () => {
      isMounted = false;
    };
  }, [isConnected, appState.userProfile, appState.requiresSignUp, rs]);

  return (
    <Columns.Column
      size="one-fifth"
      backgroundColor="white"
      style={{ minWidth: 230, minHeight: "calc(100vh - 293px)", borderRight: '1px solid #E8ECEC' }}
    >
      <Menu>
        <div className="is-flex is-align-items-center mt-3">
          <Image src={LogoImg} size={155} />
        </div>
        {process.env.DEV_ENV !== "production" &&
          process.env.DEV_ENV !== "prod" && (
            <p>
              {process.env.DEPLOYMENT_TAG
                ? process.env.DEPLOYMENT_TAG
                : process.env.DEV_ENV}
            </p>
          )}

        <hr />

        <Menu.List>
          <SidebarMenuList 
            isShowProfile={(isConnected && appState.userProfile)}
            isShowPoh={(level != "novice")}
            isShowAdminPoh={(appState?.userProfile && appState?.isAdminUser)}
            isShowLeaderBoard={(appState?.userProfile && appState?.isAdminUser)}
          />
          {providers.length > 0 ? (
            <>
              {selectedProvider ? (
                <Link
                  to="/app"
                  onClick={() => setSelectedProvider(null)}
                  style={{
                    position: "absolute",
                    top: "0px",
                    right: "2.5em",
                    maxWidth: "18em",
                  }}
                >
                  <Icon>
                    <span className="material-icons">playlist_add_check</span>
                  </Icon>
                  Switch to Moderator Dashboard
                </Link>
              ) : (
                <Dropdown
                  className="mb-5"
                  color="ghost"
                  style={{
                    position: "absolute",
                    top: "0.5em",
                    right: "1em",
                    maxWidth: "18em",
                    zIndex: 999,
                  }}
                  icon={
                    <Icon color="white">
                      <span className="material-icons">expand_more</span>
                    </Icon>
                  }
                  label={<DropdownLabel toggle={toggle} />}
                >
                  {providers.map((provider) => {
                    return (
                      <Link
                        to="/provider/admin"
                        key={provider["id"]}
                        className="dropdown-item"
                        onClick={() => setSelectedProvider(provider)}
                      >
                        {provider["name"]}
                      </Link>
                    );
                  })}
                </Dropdown>
              )}
            </>
          ) : (
            ""
          )}
        </Menu.List>
        <Button
          color="primary"
          fullwidth
          size="large"
          className="mt-6"
          onClick={toggleModal}
        >
          Invite a Moderator
        </Button>
      </Menu>
      {notificationMsg && (
        <Notification
          className="has-text-centered"
          color={notificationMsg.success ? "success" : "danger"}
        >
          {notificationMsg.value}
        </Notification>
      )}

      {showModal && <InviteModerator toggle={toggleModal} />}
    </Columns.Column>
  );
}
