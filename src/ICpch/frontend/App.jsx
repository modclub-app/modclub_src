import React from "react"
import logo from "./assets/dfinity.svg"
/*
 * Connect2ic provides essential utilities for IC app development
 */
import { createClient } from "@connect2ic/core"
import { PlugWallet } from "@connect2ic/core/providers/plug-wallet"
import { StoicWallet } from "@connect2ic/core/providers/stoic-wallet"
import { InternetIdentity } from "@connect2ic/core/providers/internet-identity"
//import { defaultProviders } from "@connect2ic/core/providers"
import { ConnectButton, ConnectDialog, Connect2ICProvider } from "@connect2ic/react"
import "@connect2ic/core/style.css"
/*
 * Import canister definitions like this:
 */
import * as ICpch from "../.dfx/local/canisters/ICpch"
/*
 * Some examples to get you started
 */
import { Transfer } from "./components/Transfer"
import { Profile } from "./components/Profile"

function App() {

  return (
    <div className="App">

      <div className="auth-section">
        <ConnectButton />
      </div>
      <ConnectDialog />

      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p className="slogan">
          React Template
        </p>
        <p className="twitter">by <a href="https://twitter.com/miamaruq">@miamaruq</a></p>
      </header>

      <p className="examples-title">
        Examples
      </p>
      <div className="examples">
        <Profile />
        <Transfer />
      </div>

    </div>
  )
}

const client = createClient({
  canisters: {
    ICpch
  },
  providers: [
    new PlugWallet(),
    new StoicWallet(),
    new InternetIdentity()
  ],
  globalProviderConfig: {
    /*
     * Disables dev mode in production
     * Should be enabled when using local canisters
     */
    dev: import.meta.env.DEV,
  },
})

export default () => (
  <Connect2ICProvider client={client}>
    <App />
  </Connect2ICProvider>
)
