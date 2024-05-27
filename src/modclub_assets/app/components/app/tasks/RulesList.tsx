import * as React from "react";
import { useState } from "react";
import { Button, Modal } from "react-bulma-components";

const Popup = ({ rules, toggle }) => {
  return (
    <Modal show={true} onClose={toggle} closeOnBlur={true} showClose={true}>
      <Modal.Card>
        <Modal.Card.Body className="px-3">
          <ul style={{ listStyle: "disc", paddingLeft: "2rem", color: "#fff" }}>
            {rules.map((rule) => (
              <li key={rule.id}>
                <div className="has-text-dark-green">{rule.description}</div>
              </li>
            ))}
          </ul>
        </Modal.Card.Body>
      </Modal.Card>
    </Modal>
  );
};

export default function RulesList({ platform, rules }) {
  const [showPopup, setShowPopup] = useState<boolean>(false);

  const toggle = () => setShowPopup(!showPopup);

  return (
    <>
      <Button color="ghost" onClick={toggle}>
        {`View ${platform}'s Rules`}
      </Button>

      {showPopup && <Popup rules={rules} toggle={toggle} />}
    </>
  );
}
