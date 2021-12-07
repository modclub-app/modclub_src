import { Link } from "react-router-dom";
import {
  Columns,
  Menu,
  Image,
  Heading,
  Icon,
  Button,
  Modal
} from "react-bulma-components";
import LogoImg from '../../../../assets/logo.png';
import SidebarUser from "./SidebarUser";
import { useAuth } from '../../../utils/auth';
import { SignIn } from '../../Auth/SignIn';
import { useHistory } from 'react-router-dom';
import { useEffect, useState } from "react";
import FormModal from "../modals/FormModal";

const InviteModerator = ({ toggle }) => {

  console.log("window", window)

  const link = `${window.location.origin}/referral=${Date.now()}`

  return (
    <Modal show={true} onClose={toggle} closeOnBlur={true} showClose={false}>
      <Modal.Card backgroundColor="circles" className="is-small">
        <Modal.Card.Body>

          <Heading subtitle>
            Invite a Moderator
          </Heading>
          <p>
            Invite moderators to earn MOD tokens. For every invited moderator that registers with MODCLUB, you will earn <span className="has-text-weight-bold">5 mod tokens</span>
          </p>

          <div className="field mt-6">
            <label className="label has-text-white">Referral Link:</label>
            <div className="control has-icons-right">
              <input className="input"
                placeholder={link}
                style={{ zIndex: -1 }}
              />
              <Icon align="right" color="white" className="is-clickable" onClick={() => {navigator.clipboard.writeText(link)}}>
                <span className="material-icons">file_copy</span>
              </Icon>
            </div>
          </div>

        </Modal.Card.Body>
        <Modal.Card.Footer className="pt-0 is-justify-content-flex-end">
          <Button.Group>
            <Button color="primary" onClick={toggle}>
              Close
            </Button>
          </Button.Group>
        </Modal.Card.Footer>
      </Modal.Card>
    </Modal>
  )
}

export default function Sidebar() {
  const history = useHistory();
  const { isAuthReady, user, isAuthenticated, requiresSignUp } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal(!showModal);

  useEffect(
    () => {
      console.log({ isAuthReady, user, isAuthenticated, requiresSignUp });
      if(isAuthReady && isAuthenticated && !user && requiresSignUp) {
        history.push("/signup");
      }
    }, [isAuthReady, isAuthenticated, user, requiresSignUp]
  )
  return (
    <Columns.Column size="one-fifth" backgroundColor="black" style={{ minWidth: 230, minHeight: "calc(100vh - 293px)" }}>
     {/* <Columns.Column size="one-fifth" backgroundColor="black"> */}

      <Menu className="p-3">
        <div className="is-flex is-align-items-center mt-3">
          <Image src={LogoImg} size={32} />
          <Heading className="ml-2" style={{ fontFamily: "sans-serif", whiteSpace: "nowrap" }}>
            MODCLUB
          </Heading>
        </div>

        <hr />

        {isAuthenticated && user ? <SidebarUser /> : <SignIn />}

        <Menu.List>
          <Link to="/app/tasks">
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
          <Link to="/app/admin">
            <Icon>
              <span className="material-icons">assignment_ind</span>
            </Icon>
            Admin
          </Link>
        </Menu.List>

        <Button color="primary" fullwidth size="large" className="mt-6" onClick={toggleModal}>
          Invite a Moderator
        </Button>

      </Menu>

      {showModal && (
        <InviteModerator toggle={toggleModal} />
      )}
    </Columns.Column>
  );
}
