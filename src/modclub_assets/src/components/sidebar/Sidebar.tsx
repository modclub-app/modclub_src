import LogoImg from '../../../assets/logo.png';
import "./Sidebar.scss";

export default function Sidebar() {
  return (
    <div className="column is-3 has-background-black">
      <aside className="p-3">
        <div className="Logo mt-3">
          <img src={LogoImg} />
          <p> MODCLUB </p>
        </div>

        <hr />

        <ul className="menu-list">
          <li>
            <a href="#">
              <span className="icon"></span>
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a href="#">
              <span className="icon"></span>
              <span>Tasks</span>
            </a>
          </li>
          <li>
            <a href="#">
              <span className="icon"></span>
              <span>Human Verification</span>
            </a>
          </li>
          <li>
            <a href="#">
              <span className="icon"></span>
              <span>Support</span>
            </a>
          </li>
          <li>
            <a href="#">
              <span className="icon"></span>
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
