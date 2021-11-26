import { Link } from "react-router-dom";
import { Dropdown, Heading, Media, Image, Icon } from "react-bulma-components";
import { useAuth } from "../../../utils/auth"
import { fileToImgSrc, unwrap } from "../../../utils/util";
import placeholder from "../../../../assets/user_placeholder.png";

export function SidebarUser() {
  const { user, logOut, identity } = useAuth();
  const imgData = unwrap(user.pic);
  const pic = imgData ? fileToImgSrc(imgData.data, imgData.imageType) : placeholder;

  const handleLogOut = async () => {
    await logOut();
  };

  return (
    <Dropdown
      hoverable
      className="mb-5"
      icon={
        <Icon color="white" style={{ marginLeft: "auto" }}>
          <span className="material-icons">expand_more</span>
        </Icon>
      }
      label={
        <>
        <Media style={{ background: "linear-gradient(to left, #3d52fa, #c91988", padding: 2, borderRadius: "50%" }}>
          <Image src={pic} size={32} rounded />
        </Media>
        <div className="ml-3">
          <Heading size={6} textAlign="left" marginless>
            {user.userName}
          </Heading>
          <p className="has-text-white is-size-7">
            {user.email}
          </p>
        </div>
      </>
      }
      color="ghost"
    >
      <Link to="/app/activity" className="dropdown-item">
        <Icon size="small" className="mr-2">
          <span className="material-icons">stars</span>
        </Icon>
        Activity
      </Link>
      <Link to="/app/settings" className="dropdown-item">
        <Icon size="small" className="mr-2">
          <span className="material-icons">logout</span>
        </Icon>
        Settings
      </Link>
      <Dropdown.Divider />
      <Dropdown.Item value="#" renderAs="a" onClick={handleLogOut}>
        <Icon size="small" className="mr-2">
          <span className="material-icons">logout</span>
        </Icon>
        Logout
      </Dropdown.Item>
    </Dropdown>

    // <div className="dropdown is-hoverable">
    //   <div className="dropdown-trigger level is-justify-content-flex-start is-clickable">
    //     <div className="user-avatar">
    //       <img src={pic} alt="User avatar"/>
    //     </div>
    //     <div className="ml-3">
    //       <label className="label has-text-white mb-0 is-flex is-align-items-flex-end is-clickable">
    //         <span>{user.userName}</span>
    //         <span className="icon has-text-white" style={{ marginLeft: "auto" }}>
    //           <span className="material-icons">expand_more</span>
    //         </span>
    //       </label>
    //       <p className="has-text-white is-size-7">
    //         {user.email}
    //       </p>
    //     </div>
    //   </div>
    //   <div className="dropdown-menu" id="dropdown-menu" role="menu">
    //     <div className="dropdown-content">

    //       <Link to="/app/activity" className="dropdown-item">
    //         <span className="icon is-small mr-2">
    //           <span className="material-icons">stars</span>
    //         </span>
    //         <span>Activity</span>
    //       </Link>
          // <Link to="/app/settings" className="dropdown-item">
          //   <span className="icon is-small mr-2">
          //     <span className="material-icons">logout</span>
          //   </span>
          //   <span>Settings</span>
          // </Link>
          // <hr className="dropdown-divider" />
          // <a href="#" className="dropdown-item" onClick={handleLogOut}>
          //   <span className="icon is-small mr-2">
          //     <span className="material-icons">logout</span>
          //   </span>
          //   <span>Logout</span>
          // </a>
    //     </div>
    //   </div>
    // </div>
  );
}