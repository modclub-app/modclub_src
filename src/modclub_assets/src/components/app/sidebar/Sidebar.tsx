import { Link } from "react-router-dom";
import "./Sidebar.scss";
import LogoImg from '../../../../assets/logo.png';
import { SidebarUser } from "./SidebarUser";
import { useAuth } from '../../../utils/auth';
import { SignIn } from '../../Auth/SignIn';

export default function Sidebar() {
  const { isAuthReady, user, isAuthenticated } = useAuth();

  return (
    <div className="column is-one-fifth has-background-black">
      <aside className="p-3">
        <div className="is-flex is-align-items-center mt-3">
          <img src={LogoImg} style={{ height: 40, width: 40}} />
          <h1 className="title is-size-3 ml-2" style={{ fontFamily: 'sans-serif' }}>MODCLUB</h1>
        </div>

        <hr />

        {isAuthenticated && user ? <SidebarUser />: <SignIn /> }

        <ul className="menu-list">
          <li>
            <Link to="/app">
              <span className="icon">
                <span className="material-icons">dehaze</span>
              </span>
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/app/moderators">
              <span className="icon">
                <span className="material-icons">assignment_ind</span>
              </span>
              <span>Moderators</span>
            </Link>
          </li>
          <li>
            <Link to="/app/tasks">
              <span className="icon">
                <span className="material-icons">playlist_add_check</span>
              </span>
              <span>Tasks</span>
            </Link>
          </li>
          <li>
            <Link to="/app/verification">
              <span className="icon">
                <span className="material-icons">check_circle_outline</span>
              </span>
              <span>Human Verification</span>
            </Link>
          </li>
          <li>
            <Link to="/app/support">
              <span className="icon">
                <span className="material-icons">help_outline</span>
              </span>
              <span>Support</span>
            </Link>
          </li>
          <li>
            <Link to="/app/admin">
              <span className="icon">
                <span className="material-icons">admin</span>
              </span>
              <span>Admin</span>
            </Link>
          </li>
        </ul>

        <button className="button is-large is-primary is-fullwidth mt-6">
          Invite a Moderator
        </button>
      </aside>
    </div>
  );
}
