import { Link } from "react-router-dom";
import { Dropdown, Heading, Media, Image, Icon } from "react-bulma-components";
import { useAuth } from "../../../utils/auth"
import { fileToImgSrc, unwrap } from "../../../utils/util";
import placeholder from "../../../../assets/user_placeholder.png";

const DropdownIcon = () => {
  return (
    <Icon color="white" style={{ marginLeft: "auto", width: 15 }}>
      <span className="material-icons">expand_more</span>
    </Icon>
  )
};

const DropdownLabel = ({ pic, user }) => {
  return (
    <>
      <Media style={{
        display: "flex",
        alignItems: "center",
        background: "linear-gradient(to left, #3d52fa, #c91988",
        padding: 2,
        borderRadius: "50%",
      }}>
        <Image
          src={pic}
          size={48}
          rounded
          style={{ overflow: "hidden", borderRadius: "50%" }}
        />
      </Media>
      <div className="ml-4 is-flex is-flex-direction-column is-justify-content-center">
        <Heading size={6} textAlign="left" marginless>
          {user.userName}
        </Heading>
        <p className="has-text-white is-size-7">
          {user.email}
        </p>
      </div>
    </>
  )
}

export default function SidebarUser() {
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
      color="ghost"
      icon={<DropdownIcon />}
      label={<DropdownLabel pic={pic} user={user} />}
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
  );
};