import { useState } from "react";
import modalbgImg from '../../../../assets/modalbg.svg';
import rejectImg from '../../../../assets/reject.svg';
import { vote } from "../../../utils/api";

const Modal = ({ active, platform, toggle, handleSave }) => (
  <div className={`modal ${active ? "is-active" : ""}`}>
    <div className="modal-background" onClick={toggle} />
    <div className="modal-card" style={{ backgroundImage: `url(${modalbgImg})`}}>
      <section className="modal-card-body">
        <img src={rejectImg} />
        <h3 className="subtitle">Reject Confirmation</h3>
        <p className="mb-3">Select which rules were broken:</p>
        <div className="card has-background-dark">
          <div className="card-content">
            <div className="field level is-relative">
              <input type="checkbox" id="sex" name="sex" /> 
              <label htmlFor="sex" className="is-clickable is-flex-grow-1">No sex or drugs</label>
            </div>
            <div className="field level is-relative">
              <input type="checkbox" id="racism" name="racism" /> 
              <label htmlFor="racism" className="is-clickable is-flex-grow-1">No Racism</label>
            </div>
            <div className="field level is-relative">
              <input type="checkbox" id="language" name="language" /> 
              <label htmlFor="language" className="is-clickable is-flex-grow-1">Post should not contain abusive language</label>
            </div>
            <div className="field level is-relative">
              <input type="checkbox" id="spam" name="spam" /> 
              <label htmlFor="spam" className="is-clickable is-flex-grow-1">No Spam</label>
            </div>
            <div className="field level is-relative">
              <input type="checkbox" id="advertising" name="advertising" /> 
              <label htmlFor="advertising" className="is-clickable is-flex-grow-1">No Advertising</label>
            </div>
            
          </div>
        </div>
      </section>
      <footer className="modal-card-foot">
        <p className="is-size-7">Voting incorrectly will result in some loss<br />of staked tokens.</p>
        <div>
          <button className="button is-dark" onClick={toggle}>CANCEL</button>
          <button className="button is-primary ml-3" onClick={handleSave}>CONFIRM</button>
        </div>
      </footer>
    </div>
  </div>
);

export default function Approve({ platform, id }) {
  const [active, setActive] = useState(false);
  const toggle = () => setActive(!active);

  const handleSave = async () => {
    console.log("handleSave")
    // TODO pending spinner
    // TODO pass which toggled
    const result = await vote(id, { rejected: null }, [] );
    console.log(result);  
    toggle();
  };

  return (
    <>
      <button className="button is-danger is-flex-grow-1" onClick={toggle}>Reject</button>
      <Modal
        active={active}
        platform={platform}
        toggle={toggle}
        handleSave={handleSave}
      />
    </>
  );
};