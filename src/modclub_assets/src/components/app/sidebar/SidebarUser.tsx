import * as React from 'react'
import { useState } from "react";
import { Link } from "react-router-dom";
import { Dropdown, Heading, Media, Image, Icon } from "react-bulma-components";
import { useAuth } from "../../../utils/auth"
import { fileToImgSrc, unwrap } from "../../../utils/util";
import placeholder from "../../../../assets/user_placeholder.png";

const DropdownLabel = ({ pic, user, toggle }) => {
  const snippet = (string, truncate) => {
    return string.length > truncate ? string.substring(0, truncate - 3) + "..." : string;
  }

  return (
    <div className="is-flex" onClick={toggle}>
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
      <div className="ml-4 is-flex is-flex-direction-column is-justify-content-center has-text-left">
        <Heading size={6} marginless>
          {snippet(user.userName, 15)}
        </Heading>
        <p className="has-text-white is-size-7">
          {snippet(user.email, 18)}
        </p>
      </div>
    </div>
  )
}

export default function SidebarUser() {
  const { user, logOut, identity } = useAuth();
  const imgData = unwrap(user.pic);
  const pic = imgData ? fileToImgSrc(imgData.data, imgData.imageType) : placeholder;

  const [showDropdown, setShowDropdown] = useState(false);
  const toggle = () => {
    setShowDropdown(!showDropdown);
  }

  const handleLogOut = async () => {
    await logOut();
  };

  return (
    <Dropdown
      className="mb-5"
      color="ghost"
      icon={
        <Icon color="white">
          <span className="material-icons">expand_more</span>
        </Icon>
      }
      label={<DropdownLabel
        pic={pic}
        user={user}
        toggle={toggle}
      />}
    >
      <Link to="/app/activity" className="dropdown-item">
        <Icon size="small" className="mr-2">
          <span className="material-icons">assignment_ind</span>
        </Icon>
        Profile
      </Link>
      <Dropdown.Divider />
      <Dropdown.Item value="#" renderAs="a" onMouseDown={handleLogOut}>
        <Icon size="small" className="mr-2">
          <span className="material-icons">logout</span>
        </Icon>
        Logout
      </Dropdown.Item>
    </Dropdown>
  );
};