import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Dropdown,
} from "react-bulma-components";

// Context
import { useProfile } from "../../../contexts/profile";

// Image
import dashboardSvg from '../../../../assets/dashboard.svg';

const DropdownLabel = ({ toggle }) => {
  return (
    <div
      onClick={toggle}
      className='menu-list-item active:_active-menu-list-item'
    >
      <span className='has-text-dark-green'>
        Provider Dashboard
      </span>
      <img src={dashboardSvg}/>
    </div>
  );
};

export const DashboardMenuList = () => {
  const { 
    providers,
    selectedProvider,
    setSelectedProvider,
  } = useProfile();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const toggle = () => setShowDropdown(!showDropdown);

  return (
    <div className='menu-list'>
      {selectedProvider ? (
        <Link
          to="/app"
          onClick={() => setSelectedProvider(null)}
          className='menu-list-item active:_active-menu-list-item'
        >
          <span className='has-text-dark-green'>
            Moderator Dashboard
          </span>
          <img src={dashboardSvg}/>
        </Link>
      ) : (
        <Dropdown
          color="ghost"
          label={<DropdownLabel toggle={toggle} />}
        >
          {providers.map((provider) => {
            return (
              <Link
                to="/provider/admin"
                key={provider["id"]}
                className="dropdown-item"
                onClick={() => setSelectedProvider(provider)}
              >
                {provider["name"]}
              </Link>
            );
          })}
        </Dropdown>
      )}
    </div>
  );
}