import * as React from "react";
import {
  isAirdropRegistered,
  airdropRegister,
  updateMC,
  getUserFromCanister,
} from "../../utils/api";
import { useAuth } from "../../utils/auth";
import { useEffect, useRef, useState } from "react";
import { SignIn } from "../auth/SignIn";
import { Principal } from "@dfinity/candid/lib/cjs/idl";
import { AirdropUser } from "../../utils/types";
import "./landing/Landing.scss";
import styled from "styled-components";

export default function AdminIdentity() {
  const { setUser, isAuthenticated, logIn, identity, isAuthReady } = useAuth();
  const [message, setMessage] = useState(null);

  const spinner = (
    <div
      className="loader is-loading is-large mt-10"
      style={{ width: 80, height: 80 }}
    ></div>
  );
  return (
    <>
      {message && (
        <div
          className={`notification has-text-centered ${
            message.success ? "is-success" : "is-danger"
          }`}
        >
          {message.value}
        </div>
      )}
      <div
        className="landing-page has-background-black"
        style={{ height: "100%" }}
      >
        <section className="hero is-black is-medium">
          <div className="hero-body container has-text-centered">
            <h1 className="title is-size-1">MODCLUB Admin Principal ID</h1>
            <p className="has-text-silver is-size-4 has-text-centered mb-6">Login to retrieve your principal ID, then provide this to your admin so they can add you as a trusted identity</p>
            <div className="is-flex is-justify-content-center	">
              {!isAuthReady ? (
                spinner
              ) : (
                <>
                    {isAuthenticated && identity? (
                      <div className="card has-gradient">
                        <div className="card-content">
                          <label className="label">Principal ID</label>
                          <p>{identity.getPrincipal().toText()}</p>
                        </div>
                      </div>
                    ) : <SignIn />}
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
