import { Principal } from "@dfinity/principal";
import { useEffect, useState } from "react";
import rejectImg from "../../../../assets/reject.svg";
import { vote, getProviderRules } from "../../../utils/api";
// import { Rule } from "../../../utils/types";

const Modal = ({
  active,
  platform,
  toggle,
  id,
  providerId
}: {
  active: boolean;
  platform: string;
  toggle: () => void;
  id: string,
  providerId: Principal;
}) => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checked, setChecked] = useState([]);

  const handleCheck = (e) => {
    const item = e.target.name;
    const isChecked = e.target.checked;
    setChecked(isChecked ? [...checked, item] : checked.filter(id => id != item));
  }

  const handleSave = async () => {
    console.log("handleSave", checked);
    setSaving(true);
    const result = await vote(id, { rejected: null }, checked);
    console.log(result);
    setSaving(false);
    toggle();
  };
  
  useEffect(() => {
    const fetchRules = async () => {
      const rules = await getProviderRules(providerId);
      console.log({ rules });       
      setRules(rules);
      setLoading(false);
    };
    fetchRules();
  }, []);
  
  let htmlContent = rules.map((rule) => (
    <div key={rule.id} className="field level is-relative" >
      <input type="checkbox" id={rule.id} name={rule.id} onClick={handleCheck} />
      <label htmlFor={rule.id} className="is-clickable is-flex-grow-1">
        {rule.description}
      </label>
    </div>
  ));
  if (loading) {
    htmlContent = (
      [<div className="loader-wrapper is-active">
        <div className="loader is-loading"></div>
      </div>])
  }
  return (
    <div className={`modal ${active ? "is-active" : ""}`}>
      <div className="modal-background" onClick={toggle} />
      <div className="modal-card has-background-circles">
        <section className="modal-card-body">
          <img src={rejectImg} className="mt-5" />
          <h3 className="subtitle mt-5">Reject Confirmation</h3>
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
            {saving ? (
            <button className="button is-primary ml-4" disabled>
              <div className="loader is-loading mr-3"></div>
              <span>VOTING...</span>
            </button>
            ) :
            <button className="button is-primary ml-4" onClick={handleSave} disabled={!checked.length}>
              CONFIRM
            </button>}
            
          </div>
        </footer>
      </div>
    </div>
  );
};

export default function Reject({ platform, id, providerId }) {
  const [active, setActive] = useState(false);
  const toggle = () => setActive(!active);

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
          id={id}
          providerId={providerId}
        />}
    </>
  );
}
