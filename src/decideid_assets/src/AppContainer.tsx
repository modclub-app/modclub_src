import * as React from "react";
import Header from "./components/header/Header";
import { HashRouter as Router } from "react-router-dom";
import External from "./components/routers/External";
import Authed from "./components/routers/Authed";
import { AuthProvider } from "./contexts/auth";

export default function AppContainer() {
  return (
    <Router>
      <Header />
      <AuthProvider>
        <Authed />
      </AuthProvider>
      <External />
    </Router>
  );
}