import { Link } from "react-router-dom";
import "./Sidebar.scss";
import LogoImg from '../../../../assets/logo.png';

import hamburgerIcon from '../../../../assets/icons/hamburger.svg';
import tasksIcon from '../../../../assets/icons/tasks.svg';
import moderatorIcon from '../../../../assets/icons/moderator.svg';


import appsIcon from '../../../../assets/icons/apps.svg';
import rewardsIcon from '../../../../assets/icons/rewards.svg';
import checkIcon from '../../../../assets/icons/check.svg';
import questionIcon from '../../../../assets/icons/question.svg';
import starIcon from '../../../../assets/icons/star.svg';
import logoutIcon from '../../../../assets/icons/logout.svg';



import { SidebarUser } from "./SidebarUser";
import { useAuth } from '../../../utils/auth';
import { SignIn } from '../../Auth/SignIn';

export default function Sidebar() {
  const { user, isAuthenticated } = useAuth();

  console.log({ user, isAuthenticated });

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
                <img src={hamburgerIcon} />
              </span>
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/app/moderators">
            <span className="icon">
                <img src={moderatorIcon} />
              </span>
              <span>Moderators</span>
            </Link>
          </li>
          <li>
            <Link to="/app/tasks">
              <span className="icon">
                <img src={tasksIcon} />
              </span>
              <span>Tasks</span>
            </Link>
          </li>
          <li>
            <Link to="/app/verification">
              <span className="icon">
                <img src={checkIcon} />
              </span>
              <span>Human Verification</span>
            </Link>
          </li>
          <li>
            <Link to="/app/support">
              <span className="icon">
                <img src={questionIcon} />
              </span>
              <span>Support</span>
            </Link>
          </li>
          <li>
            <Link to="/app/activity">
              <span className="icon">
                <img src={hamburgerIcon} />
              </span>
              <span>Activity</span>
            </Link>
          </li>
          <li>
            <a href="#">
              <span className="icon">
                <img src={logoutIcon} />
              </span>
              <span>Logout</span>
            </a>
          </li>
        </ul>

        <button className="button is-large is-primary is-fullwidth mt-6">
          Invite a Moderator
        </button>
      </aside>


      
    </div>
  );
}
