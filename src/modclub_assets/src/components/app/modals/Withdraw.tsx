import { useState } from "react";
import modalbgImg from '../../../../assets/modalbg.svg';

const Modal = ({ active, toggle }) => (
  <div className={`modal ${active ? "is-active" : ""}`}>
    <div className="modal-background" onClick={toggle} />
    <div className="modal-card" style={{ backgroundImage: `url(${modalbgImg})`}}>
      <section className="modal-card-body">
        <h3 className="subtitle mt-5">Withdraw</h3>
        <input className="input" type="text" placeholder="Wallet Address" />
        <input className="input" type="number" value="100" />
      </section>
      <footer className="modal-card-foot">
        <button className="button is-primary">
          SUBMIT
        </button>
      </footer>
    </div>
  </div>
);

export default function Withdraw() {
  const [active, setActive] = useState(false);
  const toggle = () => setActive(!active);

  return (
    <>
      <button className="button is-dark is-fullwidth" onClick={toggle}>Withdraw</button>
      <Modal
        active={active}
        toggle={toggle}
      />
    </>
  );
};