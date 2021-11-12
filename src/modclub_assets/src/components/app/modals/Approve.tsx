import { useState } from "react";
import modalbgImg from '../../../../assets/modalbg.svg';
import approveImg from '../../../../assets/approve.svg';

const Modal = ({ active, platform, toggle, handleSave }) => (
  <div className={`modal ${active ? "is-active" : ""}`}>
    <div className="modal-background" onClick={toggle} />
    <div className="modal-card" style={{ backgroundImage: `url(${modalbgImg})`}}>
      <section className="modal-card-body">
        <img src={approveImg} />
        <h3 className="subtitle mt-3">Approve Confirmation</h3>
        <p>You are confirming that this post follows {platform}'s rules.</p>
        <p>Voting incorrectly will result in some loss of staked tokens.</p>
      </section>
      <footer className="modal-card-foot">
        <a href="#">View {platform}'s rules</a>
        <div>
          <button className="button is-dark" onClick={toggle}>CANCEL</button>
          <button className="button is-primary ml-3" onClick={handleSave}>CONFIRM</button>
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
    // TODO pending spinner
    toggle();
  };

  return (
    <>
      <button className="button is-primary is-flex-grow-1" onClick={toggle}>Approve</button>
      <Modal
        active={active}
        platform={platform}
        toggle={toggle}
        handleSave={handleSave}
      />
    </>
  );
};