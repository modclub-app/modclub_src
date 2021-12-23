import { useState } from "react";

export default function RulesList({ platform, rules }) {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const toggle = () => {
    setShowDropdown(!showDropdown);
  }
  
  return (
    <div className={`dropdown is-up ${showDropdown && "is-active"}`} style={{ width: "auto" }}>
      <div className="dropdown-trigger">
        <a className="button is-ghost" aria-haspopup="true" onClick={toggle}>
          {`View ${platform}'s Rules`}
        </a>
      </div>
      <div className="dropdown-menu" role="menu">
        <div className="dropdown-content">
          {rules.map((rule) => (
            <a href="#" key={rule.id} className="dropdown-item" style={{ textDecoration: "none" }}>
              {rule.description}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};