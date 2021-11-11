import { useState } from "react";

const Modal = ({ active, platform, toggle, handleSave }) => (
  <div className={`modal ${active ? "is-active" : ""}`}>
    <div className="modal-background" onClick={toggle} />
    <div className="modal-card">
      <section className="modal-card-body">
        <h3 className="subtitle">Approve Confirmation</h3>
        <p>You are confirming that this post follows {platform}'s rules.</p>
        <p>Voting incorrectly will result in some loss of staked tokens.</p>
      </section>
      <footer className="modal-card-foot">
        <a href="#">View {platform}'s rules</a>
        <div>
          <button className="button is-dark" onClick={toggle}>CANCEL</button>
          <button className="button is-primary" onClick={handleSave}>CONFIRM</button>
        </div>
      </footer>
    </div>
  </div>
);

export default function Approve({ platform }) {
    const [active, setActive] = useState(false);
    const toggle = () => setActive(!active);
  
    const handleSave = () => {
      console.log("handleSave")
      toggle();
    };
  
    return (
      <>
        <button className="button is-primary" onClick={toggle}>Approve</button>
        <Modal
          active={active}
          platform={platform}
          toggle={toggle}
          handleSave={handleSave}
        />
      </>
    );
  };