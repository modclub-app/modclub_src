import * as React from "react";
import "./Steps.scss";

const StepContext = React.createContext({});
const StepProvider = StepContext.Provider;
const StepConsumer = StepContext.Consumer;

const Step = ({ id, details }) => {
  return (
    <StepConsumer>
      {(context) => {
        return (
          <li
            className={`step-item
            ${context == Number(id) ? "is-active" : ""}
            ${context > Number(id) ? "is-completed" : ""}
          `}
          >
            <div className="step-marker">
              <span>{id}</span>
            </div>
            {details && (
              <div className="step-details">
                <p className="step-title">{details}</p>
              </div>
            )}
          </li>
        );
      }}
    </StepConsumer>
  );
};

const Steps = ({ activeStep, children }) => {
  const ids = [].concat.apply([], children).map((child) => child.key);
  const index = ids.indexOf(activeStep) + 1;

  return (
    <StepProvider value={index}>
      <ul className="steps">{children}</ul>
    </StepProvider>
  );
};

export { Steps, Step };
