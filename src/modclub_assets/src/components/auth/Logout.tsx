import React from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../utils/auth";

const Logout = () => {
  const history = useHistory();
  const { logOut, isActorReady } = useAuth();

  const handleLogout = () => {
    logOut();

    // Redirect to the home page after logout
    history.push("/");
  };

  // Call the logout function as soon as the component mounts
  React.useEffect(() => {
    handleLogout();
  }, []);

  return <div>Logging out...</div>; // You can display a message or a loading spinner while logging out
};

export default Logout;
