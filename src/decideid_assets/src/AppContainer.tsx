import * as React from "react";
import Header from "./components/header/Header";
import { HashRouter, Route , Routes} from "react-router-dom";
import Authed from "./components/routers/Authed";
import { AuthProvider } from "./contexts/auth";
import Landing from "./components/external/landing/Landing";

export default function AppContainer() {
  return (
    <div>
      <Header />
      <HashRouter>
        <Routes>
          {/* Below routes are external and do not require authentication. */}
          <Route path="/" element={<Landing />} />

          {/* The following routes necessitate authentication. */}
          <Route path="*" element={<AuthProvider><Authed /></AuthProvider>} />
        </Routes>
      </HashRouter>
    </div>
  );
}