import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../utils/auth"
import { fileToImgSrc, unwrap } from "../../../utils/util";
import placeholder from "../../../../assets/user_placeholder.png";


export function SidebarUser() {
  const [active, setActive] = useState(false);  
  const { user, logOut } = useAuth();
  const imgData = unwrap(user.pic);
  const pic = imgData ? fileToImgSrc(imgData.data, imgData.imageType) : placeholder;

  const toggle = () => setActive(!active);

  const handleLogOut = async () => {
    await logOut();
  };

  return (
    <div className={`dropdown ${active ? "is-active" : ""}`}>
      <div className="dropdown-trigger level is-justify-content-flex-start is-clickable" onClick={toggle}>
        <div className="user-avatar">
          <img src={pic} alt="User avatar"/>
        </div>
        <div className="ml-3">
          <label className="label has-text-white mb-0 is-flex is-align-items-flex-end is-clickable">
            <span>{user.userName}</span>
            <span className="icon has-text-white" style={{ marginLeft: 'auto' }}>
              <span className="material-icons">expand_more</span>
            </span>
          </label>
          <p className="has-text-white is-size-7">
            {user.email}
          </p>
        </div>
      </div>
      <div className="dropdown-menu" id="dropdown-menu" role="menu">
        <div className="dropdown-content">

          <Link to="/app/activity" className="dropdown-item">
            <span className="icon is-small mr-2">
              <span className="material-icons">stars</span>
            </span>
            <span>Activity</span>
          </Link>
          <Link to="/app/settings" className="dropdown-item">
            <span className="icon is-small mr-2">
              <span className="material-icons">logout</span>
            </span>
            <span>Settings</span>
          </Link>
          <hr className="dropdown-divider" />
          <a href="#" className="dropdown-item" onClick={handleLogOut}>
            <span className="icon is-small mr-2">
              <span className="material-icons">logout</span>
            </span>
            <span>Logout</span>
          </a>
        </div>
      </div>
    </div>
  );
}