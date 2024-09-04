import React, { useEffect, useState } from "react";
import Header from "../header/Header";
import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import NewProfile from "../auth/new_profile/NewProfile";
import NewPohProfile from "../auth/poh/NewPohProfile";
import AdminIdentity from "./AdminIdentity";
import Privacy from "./Privacy";
import Terms from "./Terms";
import HowTo from "./HowTo";
import Logout from "../auth/Logout";
import Airdrop from "./Airdrop/Airdrop";
import MigratedUsersAirdrop from "./migrated_users_airdrop/index";
import ProviderApp from "./provider/App";

export default function External() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/signup" element={<NewProfile />} />
        <Route path="/new-poh-profile" element={<NewPohProfile />} />
        <Route path="/admin-identity" element={<AdminIdentity />} />
        <Route path="/provider" element={<ProviderApp />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/how-to" element={<HowTo />} />
        <Route path="/airdrop" element={<Airdrop />} />
        <Route
          path="/migrated-users-airdrop"
          element={<MigratedUsersAirdrop />}
        />
      </Routes>
    </>
  );
}
