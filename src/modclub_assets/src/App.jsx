import React, { useCallback, useEffect, useState } from "react";
import "./index.scss";
import "./App.scss";
import hero from "../assets/HeroImage.png";
import section1 from "../assets/Section1.png";
import section2 from "../assets/Section2.png";
import section3 from "../assets/Section3.png";

import { modclub } from "../../declarations/modclub";

// Component for the outlined button
function ButtonOutlined(props) {
  return (
    <div className="signup">
      <input
        disabled={props.isLoading}
        type="email"
        id="email"
        name="email"
        placeholder="Enter your email..."
        className="textInput"
        onChange={(e) => {
          props.onChange(e.target.value);
        }}
      />
      <button
        disabled={props.isLoading}
        type="submit"
        className="ButtonOutlined"
        onClick={async () => {
          props.setIsLoading(true);
          props.setResult(await modclub.addToWaitList(props.text));
        }}
      >
        {props.isLoading && (
          <i className="fa fa-refresh fa-spin" style={{ marginRight: "5px" }} />
        )}
        Join the Beta
      </button>
    </div>
  );
}

function FeatureComponent(props) {
  return (
    <div className="modclub-home-feature">
      <img src={props.image} />
      <div className="text-wrapper">
        <div className="text">{props.text}</div>
        <div className="description">{props.description}</div>
      </div>
    </div>
  );
}

function App() {
  let [emailText, setEmailText] = useState("");
  let [isLoading, setIsLoading] = useState(false);
  let [result, setResult] = useState("");

  return (
    <div className="modclub-home">
      <p className="siteTitle">MODCLUB</p>
      <div className="inner">
        <div className="left">
          <h1>The easy way to moderate user generated content </h1>
          <h2>
            Modclub lets you earn rewards for moderating user generated content
            on the Internet Computer
          </h2>
          {result != "" ? (
            <h3>{result}</h3>
          ) : (
            <ButtonOutlined
              onChange={setEmailText}
              text={emailText}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              setResult={setResult}
            />
          )}
        </div>
        <div className="right">
          <img src={hero} />
        </div>
      </div>
      <div className="features">
        <FeatureComponent
          image={section1}
          text="A central place to moderate content"
          description="Modclub works with dApps hosted on the Internet Computer that need content moderation but don't want to build it themselves.
          "
        />
        <FeatureComponent
          image={section2}
          text="Simplified moderation process"
          description="Modclub simplifies the moderation process and it makes it easy for moderators and dApps to work together."
        />
        <FeatureComponent
          image={section3}
          text="Earn rewards"
          description="Moderators earn reward tokens for actively moderating and participating on the platform."
        />
      </div>
      <div className="join-footer">
        <div className="text">
          We’re in beta right now. Anyone can join the waitlist and we'll notify
          you once we start letting people in.
        </div>
      </div>
    </div>
  );
}

export default App;
