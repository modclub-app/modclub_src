import React from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useConnect } from "@connect2icmodclub/react";

// Icons
import userIdIconSvg from '../../../../assets/user_id_icon.svg';
import documentTextSvg from '../../../../assets/document_text.svg';
import usersGroupRoundedSvg from '../../../../assets/users_group_rounded.svg';
import howToIconSvg from '../../../../assets/how_to_icon.svg';
import logOutSvg from '../../../../assets/logout_icon.svg';
import clipboardCheckSvg from '../../../../assets/clipboard_check.svg';
import leaderboardStarSvg from '../../../../assets/leaderboard_star.svg';

export const SidebarMenuList = ({ 
  isShowPoh, 
  isShowAdminPoh, 
  isShowLeaderBoard,
  isShowProfile,
}) => {
  const history = useHistory();
  const { disconnect } = useConnect();

  /**
   * Logout from site
   */
  const handleLogOut = async () => {
    await disconnect();
  };

  const SIDEBAR_MENU_ITEMS_MAP = [{
    name: 'Profile page',
    linkTo: '/app/activity',
    iconName: userIdIconSvg,
    isShow: isShowProfile,
  }, {
    name: 'Task moderation',
    linkTo: '/app',
    iconName: documentTextSvg,
    isShow: true,
  }, {
    name: 'Human Verification',
    linkTo: '/app/poh',
    iconName: usersGroupRoundedSvg,
    isShow: isShowPoh,
  }, {
    name: 'Admin POH Content',
    linkTo: '/app/admin/poh',
    iconName: clipboardCheckSvg,
    isShow: isShowAdminPoh,
  }, {
    name: 'Leaderboard',
    linkTo: '/app/leaderboard',
    iconName: leaderboardStarSvg,
    isShow: isShowLeaderBoard,
  }, null, {
    name: 'How To',
    linkTo: '/how-to',
    iconName: howToIconSvg,
    isShow: true,
  }]

  return (
    <React.Fragment>
      {SIDEBAR_MENU_ITEMS_MAP.map(item => (
        <React.Fragment>
          {item === null && (
            <div className='divider' />
          )}

          {item?.isShow && (
            <Link 
              key={item?.linkTo}
              to={item?.linkTo}
              className={`menu-list-item ${history.location.pathname === item.linkTo && '_active-menu-list-item'}`}
            >
              <span className='has-text-dark-green'>
                {item?.name}
              </span>
              <img src={item?.iconName}/>
            </Link>
          )}
        </React.Fragment>
      ))}

      <Link 
        renderAs="a" 
        onMouseDown={handleLogOut}
        className='menu-list-item'
      >
        <span className='has-text-dark-green'>
          Log out
        </span>
        <img src={logOutSvg} />
      </Link>
    </React.Fragment>
  );
}