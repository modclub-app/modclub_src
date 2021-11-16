import { useAuth } from "../../../utils/auth"
import { fileToImgSrc, unwrap } from "../../../utils/util";
import placeholder from "../../../../assets/user_placeholder.png";
import "./SidebarUser.scss";


export function SidebarUser() {
  const { user } = useAuth();
  const imgData = unwrap(user.pic);
  const pic = imgData ? fileToImgSrc(imgData.data, imgData.imageType) : placeholder; ;
  return (
    <div className="sidebar__user">
      <div className="sidebar__user-avatar">
        <img src={pic} alt="User avatar"/>
      </div>
        <div className="is-flex-direction-column ml-2" >
          <p className="sidebar__user-name">
            {user.userName}
          </p>
          <p className="sidebar__user-email">
            {user.email}
            </p>
        </div>
    </div>
  );
  }