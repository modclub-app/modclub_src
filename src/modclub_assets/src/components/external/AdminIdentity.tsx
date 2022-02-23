import * as React from "react";
import {
  isAirdropRegistered,
  airdropRegister,
  updateMC,
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
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [aidropUser, setAirdropUser] = useState<AirdropUser>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await updateMC();
        setAirdropUser(await isAirdropRegistered());
        setIsRegistered(true);
      } catch (e) {
        console.log(e);
      }
      setLoading(false);
    };
    console.log("isAuthReady", isAuthReady);
    console.log("isAuthenticated", isAuthenticated);
    console.log("identity", identity && identity.getPrincipal().toText());

    if (
      isAuthReady &&
      isAuthenticated &&
      identity &&
      !identity.getPrincipal().isAnonymous()
    ) {
      setLoading(true);
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, identity]);

  const handleRegister = async () => {
    setSubmitting(true);
    try {
      const user = await airdropRegister();
      setAirdropUser(user);
      setIsRegistered(true);
    } catch (e) {
      console.log(e);
      setMessage(e.message);
    }
    setSubmitting(false);
  };

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
            <h1 className="title is-size-1">MODCLUB Admin Registration</h1>
            <p className="has-text-silver is-size-4 has-text-centered mb-6"></p>
            <div className="is-flex is-justify-content-center	">
              {!isAuthReady || loading ? (
                spinner
              ) : (
                <>
                  {!isAuthenticated ? (
                    <SignIn />
                  ) : aidropUser ? (
                    <div className="card has-gradient">
                      <div className="card-content">
                        <label className="label">Principal ID</label>
                        <p>{identity}</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="has-text-silver is-size-4 has-text-centered mb-6">
                        Please Register as user first
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
