import { Link } from "react-router-dom";
import { Columns, Menu, Image, Heading, Icon, Button } from "react-bulma-components";
import LogoImg from '../../../../assets/logo.png';
import { SidebarUser } from "./SidebarUser";
import { useAuth } from '../../../utils/auth';
import { SignIn } from '../../Auth/SignIn';
import { useHistory } from 'react-router-dom';
import { useEffect } from "react";

export default function Sidebar() {
  const history = useHistory();
  const { isAuthReady, user, isAuthenticated, requiresSignUp } = useAuth();
  useEffect(
    () => {
      if (!isAuthReady) return;
      if (!isAuthenticated) return;
      if(!user && requiresSignUp) {
        history.push('/signup');
      }
    }, [isAuthReady, isAuthenticated, user]
  )
  return (
    <Columns.Column size="one-fifth" backgroundColor="black" style={{ minWidth: 230, minHeight: "calc(100vh - 293px)" }}>
      <Menu className="p-3">
        <div className="is-flex is-align-items-center mt-3">
          <Image src={LogoImg} size={32} />
          <Heading className="ml-2" style={{ fontFamily: "sans-serif" }}>
            MODCLUB
          </Heading>
        </div>

        <hr />

        {isAuthenticated && user ? <SidebarUser /> : <SignIn />}

        <Menu.List>
          <Link to="/app">
            <Icon>
              <span className="material-icons">dehaze</span>
            </Icon>
            Dashboard
          </Link>
          <Link to="/app/moderators">
            <Icon>
              <span className="material-icons">assignment_ind</span>
            </Icon>
            Moderators
          </Link>
          <Link to="/app/tasks">
            <Icon>
              <span className="material-icons">playlist_add_check</span>
            </Icon>
            Tasks
          </Link>
          <Link to="/app/verification">
            <Icon>
              <span className="material-icons">check_circle_outline</span>
            </Icon>
            Human Verification
          </Link>
          <Link to="/app/support">
            <Icon>
              <span className="material-icons">help_outline</span>
            </Icon>
            Support
          </Link>
          <Link to="/app/admin">
            <Icon>
              <span className="material-icons">assignment_ind</span>
            </Icon>
            Admin
          </Link>
        </Menu.List>

        <Button color="primary" fullwidth size="large" className="mt-6">
          Invite a Moderator
        </Button>

      </Menu>
    </Columns.Column>
  );
}
