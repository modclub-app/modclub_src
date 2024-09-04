import * as React from "react";
import { useEffect } from "react";
import { Usergeek } from "usergeek-ic-js";
import "./bulma.css";
import "./App.scss";
import "./Responsive.scss";

import { HashRouter as Router, Routes, Route } from "react-router-dom";

import { StateProvider } from "./components/app/state_mgmt/provider";
import External from "./components/external/External";
import ModclubApp from "./components/app/ModclubApp";

import { ProfileProvider } from "./contexts/profile";

export default function App() {
  return (
    <StateProvider>
      <ProfileProvider>
        <Router>
          <Routes>
            <Route path="/app" element={<ModclubApp />} />
          </Routes>
        </Router>
      </ProfileProvider>
      <Router>
        <Routes>
          <Route path="/" element={<External />} />
        </Routes>
      </Router>
    </StateProvider>
  );
}