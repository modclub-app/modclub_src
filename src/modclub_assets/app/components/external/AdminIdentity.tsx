import * as React from "react";
import { useState } from "react";
import { SignIn } from "../auth/SignIn";
import "./landing/Landing.scss";
import { useConnect } from "@connect2icmodclub/react";

export default function AdminIdentity() {
  const { isConnected, principal } = useConnect();
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
            <p className="has-text-silver is-size-4 has-text-centered mb-6">
              Login to retrieve your principal ID, then provide this to your
              admin so they can add you as a trusted identity
            </p>
            <div className="is-flex is-justify-content-center	">
              {!isConnected ? (
                spinner
              ) : (
                <>
                  {principal ? (
                    <div className="card has-gradient">
                      <div className="card-content">
                        <label className="label">Principal ID</label>
                        <p>{principal}</p>
                      </div>
                    </div>
                  ) : (
                    <SignIn />
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
