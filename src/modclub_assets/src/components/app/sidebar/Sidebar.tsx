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
  Dropdown
} from "react-bulma-components";
import LogoImg from "../../../../assets/logo.png";
import SidebarUser from "./SidebarUser";
import { useAuth } from "../../../utils/auth";
import { SignIn } from "../../auth/SignIn";
import { useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
import FormModal from "../modals/FormModal";

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
          <Heading size={6} >
            Switch to Provider Dashboard
          </Heading>
        </div>
      </div>
    </>
  )
}

export default function Sidebar() {
  const history = useHistory();
  const { isAuthReady, user, isAuthenticated, requiresSignUp, providers, setSelectedProvider, selectedProvider } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal(!showModal);
  const [showDropdown, setShowDropdown] = useState(false);
  const toggle = () => setShowDropdown(!showDropdown);

  useEffect(() => {
    if (isAuthReady && isAuthenticated && !user && requiresSignUp) {
      history.push("/signup");
    }
  }, [isAuthReady, isAuthenticated, user, requiresSignUp]);
  return (
    <Columns.Column
      size="one-fifth"
      backgroundColor="black"
      style={{ minWidth: 230, minHeight: "calc(100vh - 293px)" }}
    >
      <Menu className="p-3">
        <div className="is-flex is-align-items-center mt-3">
          <Image src={LogoImg} size={32} />
          <Heading
            className="ml-2"
            style={{ fontFamily: "sans-serif", whiteSpace: "nowrap" }}
          >
            MODCLUB
          </Heading>
        </div>

        <hr />

        {isAuthenticated && user ? <SidebarUser /> : <SignIn />}

        <Menu.List>
          <Link to="/app">
            <Icon>
              <span className="material-icons">playlist_add_check</span>
            </Icon>
            Tasks
          </Link>
          <Link to="/app/poh">
            <Icon>
              <span className="material-icons">check_circle_outline</span>
            </Icon>
            Human Verification
          </Link>
          <Link to="/app/leaderboard">
            <Icon>
              <span className="material-icons">stars</span>
            </Icon>
            Leaderboard
          </Link>
          <Link to="/how-to">
            <Icon>
              <span className="material-icons">help</span>
            </Icon>
            How To
          </Link>
          {providers.length > 0 ? (
            <>
              {selectedProvider ? (
                <Link to="/app" onClick={() => setSelectedProvider(null)} style={{ position: "absolute", top: "0px", right: "2.5em", maxWidth: "18em" }}>
                  <Icon>
                    <span className="material-icons">playlist_add_check</span>
                  </Icon>
                  Switch to Moderator Dashboard
                </Link>
              ) : (
                <Dropdown
                  className="mb-5"
                  color="ghost"
                  style={{ position: "absolute", top: "0.5em", right: "1em", maxWidth: "18em", zIndex: 999 }}
                  icon={
                    <Icon color="white">
                      <span className="material-icons">expand_more</span>
                    </Icon>
                  }
                  label={<DropdownLabel
                    toggle={toggle}
                  />}
                >

                  {providers.map((provider) => {
                    return (
                      <Link to="/app/admin" key={provider['id']} className="dropdown-item" onClick={() => setSelectedProvider(provider)}>
                        {provider['name']}
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

      {showModal && <InviteModerator toggle={toggleModal} />}
    </Columns.Column >
  );
}
