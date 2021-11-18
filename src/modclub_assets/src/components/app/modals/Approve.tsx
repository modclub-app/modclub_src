import { Principal } from "@dfinity/principal";
import { useEffect, useState } from "react";
import approveImg from '../../../../assets/approve.svg';
import { vote, getProviderRules } from "../../../utils/api";

const RulesList = ({ providerId} : { providerId: Principal }) => {
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
  
  return (
    <div className="dropdown-menu" id="dropdown-menu7" role="menu">
      <div className="dropdown-content">
        {loading ?
          <div className="loader is-loading"></div>
          :
          rules.map((rule) => (
            <a key={rule.id} className="dropdown-item">
              {rule.description}
            </a>)
          )
        }
      </div>
    </div>
  );
};

const Modal = ({
  active,
  platform,
  toggle,
  handleSave,
  saving,
  message,
  providerId
}: {
  active: boolean;
  platform: string;
  toggle: () => void;
  handleSave: () => void;
  saving: boolean;
  message: any;
  providerId: Principal;
}) => {

  const [showRules, setShowRules] = useState(false);

  const toggleRules = () => setShowRules(!showRules);

  return (
    <div className={`modal ${active ? "is-active" : ""}`}>
      <div className="modal-background" onClick={toggle} />
      <div className="modal-card has-background-circles">
        <section className="modal-card-body">
          <img src={approveImg} className="mt-5" />
          <h3 className="subtitle mt-5">Approve Confirmation</h3>
          <p>You are confirming that this post follows {platform}'s rules.</p>
          <p>Voting incorrectly will result in some loss of staked tokens.</p>
        </section>
        <footer className="modal-card-foot">

          <div className="dropdown is-up is-active">
            <div className="dropdown-trigger">
              <a onClick={toggleRules}>View {platform}'s rules</a>
            </div>
            {showRules &&
              <RulesList providerId={providerId} />
            }
          </div>

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
};


export default function Approve({ platform, id, providerId }) {
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
        providerId={providerId}
      />
    </>
  );
};