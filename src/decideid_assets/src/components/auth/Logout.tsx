import React from "react";
import { useNavigate } from "react-router-dom";
import { useConnect } from "@connect2icmodclub/react";

const Logout = () => {
  const navigate = useNavigate();

  const { disconnect } = useConnect();
  const handleLogout = () => {
    disconnect();
    // Redirect to the home page after logout
    navigate("/");
  };

  // Call the logout function as soon as the component mounts
  React.useEffect(() => {
    handleLogout();
  }, []);

  return <div>Logging out...</div>; // You can display a message or a loading spinner while logging out
};

export default Logout;
