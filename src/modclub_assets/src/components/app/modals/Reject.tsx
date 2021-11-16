import { Principal } from "@dfinity/principal";
import { useEffect, useState } from "react";
import modalbgImg from "../../../../assets/modalbg.svg";
import rejectImg from "../../../../assets/reject.svg";
import { vote, getProviderRules } from "../../../utils/api";
import "./Modals.scss";
import { Rule } from "../../../utils/types";

const Modal = ({
  active,
  platform,
  toggle,
  handleSave,
  providerId
}: {
  active: boolean;
  platform: string;
  toggle: () => void;
  handleSave: () => Promise<void>;
  providerId: Principal;
  }) => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchRules = async () => {
        const rules = await getProviderRules(providerId);
        console.log({ rules });       
        setRules(rules);
        setLoading(false);
      };
      fetchRules();
    }, []);

  
  let htmlContent = rules.map((rule) => {
    return (
      <div className="field level is-relative">
        <input type="checkbox" id={rule.id} name={rule.id} />
        <label htmlFor={rule.id} className="is-clickable is-flex-grow-1">
          {rule.description}
        </label>
      </div>
    );
  });
  if (loading) {
    htmlContent = (
      [<div className="loader-wrapper is-active">
        <div className="loader is-loading"></div>
      </div>])
  }
  return (
    <div className={`modal ${active ? "is-active" : ""}`}>
      <div className="modal-background" onClick={toggle} />
      <div
        className="modal-card"
        style={{ backgroundImage: `url(${modalbgImg})` }}
      >
        <section className="modal-card-body">
          <img src={rejectImg} />
          <h3 className="subtitle">Reject Confirmation</h3>
          <p className="mb-3">Select which rules were broken:</p>
          <div className="card has-background-dark">
            <div className="card-content">{htmlContent}</div>
          </div>
        </section>
        <footer className="modal-card-foot">
          <p className="is-size-7">
            Voting incorrectly will result in some loss
            <br />
            of staked tokens.
          </p>
          <div>
            <button className="button is-dark" onClick={toggle}>
              CANCEL
            </button>
            <button className="button is-primary ml-3" onClick={handleSave}>
              CONFIRM
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default function Reject({ platform, id, providerId }) {
  const [active, setActive] = useState(false);
  

  const toggle = () => setActive(!active);


  const handleSave = async () => {
    console.log("handleSave");
    // TODO pending spinner
    // TODO pass which toggled
    const result = await vote(id, { rejected: null }, []);
    console.log(result);
    toggle();
  };

  return (
    <>
      <button className="button is-danger is-flex-grow-1" onClick={toggle}>
        Reject
      </button>
      {
        active &&
        <Modal
          active={active}
          platform={platform}
          toggle={toggle}
          handleSave={handleSave}
          providerId={providerId}
        />}
    </>
  );
}
