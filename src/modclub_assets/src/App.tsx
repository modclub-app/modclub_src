import React from "react";
import "./App.scss";
import Header from "./components/header/Header";
import Landing from "./components/landing/Landing";
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

function App() {
  return (
    <div className="main" >
      <Header />
      <Landing />
    </div>
  );
}

export default App;
