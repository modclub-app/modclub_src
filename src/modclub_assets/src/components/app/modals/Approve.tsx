import { useState } from "react";
import modalbgImg from '../../../../assets/modalbg.svg';
import approveImg from '../../../../assets/approve.svg';
import { vote } from "../../../utils/api";

const Modal = ({ active, platform, toggle, handleSave, saving, message }) => (
  <div className={`modal ${active ? "is-active" : ""}`}>
    <div className="modal-background" onClick={toggle} />
    <div className="modal-card" style={{ backgroundImage: `url(${modalbgImg})`}}>
      <section className="modal-card-body">
        <img src={approveImg} />
        <h3 className="subtitle mt-5">Approve Confirmation</h3>
        <p>You are confirming that this post follows {platform}'s rules.</p>
        <p>Voting incorrectly will result in some loss of staked tokens.</p>
      </section>
      <footer className="modal-card-foot">
        <a href="#">View {platform}'s rules</a>
        <div>
          <button className="button is-dark" onClick={toggle}>CANCEL</button>
          {saving ? (
            <button className="button is-primary ml-4" disabled>
              <div className="loader is-loading mr-3"></div>
              <span>VOTING...</span>
            </button>
            ) :
            <button className="button is-primary ml-4" onClick={handleSave}>
              CONFIRM
            </button>}
        </div>
      </footer>
    </div>

    {message &&
      <div className={`notification has-text-centered ${message.success ? "is-success" : "is-danger"}`}>
        {message.value}
      </div>
    }
  </div>
);

export default function Approve({ platform, id }) {
  const [active, setActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const toggle = () => setActive(!active);

  const handleSave = async () => {
    console.log("handleSave")
    setSaving(true);
    const result = await vote(id, { approved: null }, []);
    console.log("result", result);
    setSaving(false);
    setMessage({ success: result === "Vote successful" ? true : false, value: result });
    setTimeout(() => toggle(), 2000); 
  };

  return (
    <>
      <button className="button is-primary is-flex-grow-1" onClick={toggle}>Approve</button>
      <Modal
        active={active}
        platform={platform}
        toggle={toggle}
        handleSave={handleSave}
        saving={saving}
        message={message}
      />
    </>
  );
};