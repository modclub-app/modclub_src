import { useAuth } from "../../../utils/auth"
import { fileToImgSrc, unwrap } from "../../../utils/util";
import placeholder from "../../../../assets/user_placeholder.png";

export function SidebarUser() {
  const { user } = useAuth();
  const imgData = unwrap(user.pic);
  const pic = imgData ? fileToImgSrc(imgData.data, imgData.imageType) : placeholder;

  return (
    <div className="level is-justify-content-flex-start">
      <div className="user-avatar">
        <img src={pic} alt="User avatar"/>
      </div>
      <div className="ml-3">
        <label className="label has-text-white mb-0 is-flex is-align-items-flex-end">
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
  );
}