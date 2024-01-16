import React from "react";
import { Redirect, Route } from "react-router-dom";

const AdminRoute = ({ component: Component, appState, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        if (appState?.userProfile && appState?.isAdminUser) {
          return <Component {...props} />;
        } else {
          return <Redirect to="/app" />;
        }
      }}
    />
  );
};

export default AdminRoute;
