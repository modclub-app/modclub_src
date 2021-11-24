// import { Link } from "react-router-dom";
import { Form, Field } from "react-final-form";
import { useEffect, useState } from "react";
import EditApp from "../modals/EditApp";
import TrustedIdentities from "../trusted_identities/TrustedIdentities";
import walletImg from '../../../../assets/wallet.svg';
import stakedImg from '../../../../assets/staked.svg';

const EditRulesModal = ({ rules, toggle }) => {
  const [ submitting, setSubmitting ] = useState<boolean>(false);
  const [newRules, setNewRules] = useState(rules);

  const remove = (rule) => {
    setNewRules(newRules.filter(item => item !== rule));
  }

  const add = (rule) => {
    rule && setNewRules([...newRules, rule]);
  }

  const onFormSubmit = async () => {
    console.log("onFormSubmit newRules", newRules);
    setSubmitting(true);
    setSubmitting(false);
    setTimeout(() => toggle(), 2000); 
  };

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={toggle} />
      <div className="modal-card is-small has-background-circles">
      <Form
        onSubmit={onFormSubmit}
        render={({ handleSubmit, values }) => (
          <form onSubmit={handleSubmit}>
            <section className="modal-card-body">
              <h3 className="subtitle">Edit Rules</h3>

              {newRules.map((rule) => (
                <div key={rule} className="field level">
                  <Field
                    name={rule}
                    component="input"
                    type="text"
                    className="input"
                    placeholder={rule}
                    value={rule}
                    disabled
                  />
                  <span className="icon has-text-danger is-clickable ml-3" onClick={() => remove(rule)}>
                    <span className="material-icons">remove_circle</span>
                  </span>
                </div>
              ))}

              <div className="field level">
                <Field
                  name="newRule"
                  component="input"
                  type="text"
                  className="input"
                  placeholder="Add New Restriction"
                />
                
                <span className="icon has-text-success ml-3" onClick={() => [add(values.newRule), values.newRule = null]}>
                  {values.newRule && <span className="material-icons is-clickable">add_circle</span>}
                </span>
                
              </div>

            </section>
            <footer className="modal-card-foot pt-0 is-justify-content-flex-end">
              <button className="button is-dark mr-4" onClick={toggle}>
                Cancel
              </button>
              {submitting ? 
                <button className="button is-primary" disabled>
                  <span className="icon mr-2 loader is-loading"></span>
                  <span>SAVING...</span>
                </button> 
                :
                <button className="button is-primary">
                  SAVE
                </button>
              }
            </footer>
          </form>
        )}
      />
      </div>
    </div>
  )
}


const EditModeratorSettingsModal = ({ toggle }) => {
  const [ submitting, setSubmitting ] = useState<boolean>(false);

  const onFormSubmit = async (values: any) => {
    console.log("onFormSubmit values", values);
    setSubmitting(true);
    setSubmitting(false);
    setTimeout(() => toggle(), 2000); 
  };

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={toggle} />
      <div className="modal-card is-small has-background-circles">
      <Form
        onSubmit={onFormSubmit}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <section className="modal-card-body">
              <h3 className="subtitle">Edit Moderator Settings</h3>

              <div className="field level">
                <p>Number of votes required to finalize decision:</p>
                <Field
                  name="minVotes"
                  component="input"
                  type="number"
                  className="input has-text-centered ml-3"
                  initialValue={5}
                  style={{ width: 70 }}
                />
              </div>

              <div className="field level">
                <p>Required number of staked MOD tokens to vote:</p>
                <Field
                  name="minTokens"
                  component="input"
                  type="number"
                  className="input has-text-centered ml-3"
                  initialValue={1000}
                  style={{ width: 70 }}
                />
              </div>

              <div className="field level">
                <p>Example cost per each succesful vote (1% of stake):</p>
                <Field
                  name="cost"
                  component="input"
                  type="number"
                  className="input has-text-centered ml-3"
                  initialValue={1}
                  style={{ width: 70 }}
                />
              </div>

              <div className="field level">
                <p>Number of your platform tokens to be distributed to the majority voters (optional):</p>
                <Field
                  name="tokens"
                  component="input"
                  type="number"
                  className="input has-text-centered ml-3"
                  initialValue={5}
                  style={{ width: 70 }}
                />
              </div>

            </section>
            <footer className="modal-card-foot pt-0 is-justify-content-flex-end">
              <button className="button is-dark mr-4" onClick={toggle}>
                Cancel
              </button>
              {submitting ? 
                <button className="button is-primary" disabled>
                  <span className="icon mr-2 loader is-loading"></span>
                  <span>SAVING...</span>
                </button> 
                :
                <button className="button is-primary">
                  SAVE
                </button>
              }
            </footer>
          </form>
        )}
      />
      </div>
    </div>
  )
}


export default function Admin() {
  const [showEditApp, setShowEditApp] = useState(false);
  const toggleEditApp = () => setShowEditApp(!showEditApp);

  const [showEditRules, setShowEditRules] = useState(false);
  const toggleEditRules = () => setShowEditRules(!showEditRules);

  const [showModeratorSettings, setShowModeratorSettings] = useState(false);
  const toggleModeratorSettings = () => setShowModeratorSettings(!showModeratorSettings);

  const dummyRules = ["No drugs & weapsons", "No sexual content", "No racism"]

  return (
    <>
      <div className="columns is-multiline">
        <div className="column is-two-thirds">
          <div className="card is-fullheight is-flex">
            <div className="card-content columns">

              <div className="column is-one-third">
                <div className="card has-gradient">
                  <div className="card-content py-6">
                    <h1 className="title has-text-centered">
                      DSCVR<br/>logo
                    </h1>
                  </div>
                </div>
              </div>

              <div className="column">
                <table className="table is-label">
                  <tbody>
                    <tr>
                      <td>App Name:</td>
                      <td>DSCVR</td>
                    </tr>
                    <tr>
                      <td>Description:</td>
                      <td>DSCVR is a reddit like community that exists on the internet computer.</td>
                    </tr>
                  </tbody>
                </table>
                <button className="button is-dark" onClick={toggleEditApp}>
                  Edit App
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="column">
          <div className="card is-fullheight">
            <div className="card-content">
              <h4 className="subtitle">
                Stats
              </h4>

              <table className="table is-striped has-text-left">
                <tbody>
                  <tr>
                    <td>Total Feeds Posted</td>
                    <td>8373</td>
                  </tr>
                  <tr>
                    <td>Active Posts</td>
                    <td>5</td>
                  </tr>
                  <tr>
                    <td>Rewards Spent</td>
                    <td>5</td>
                  </tr>
                  <tr>
                    <td>Avg. Stakes</td>
                    <td>100</td>
                  </tr>
                  <tr>
                    <td>Humans Verified</td>
                    <td>3434</td>
                  </tr>
                </tbody>
              </table>

            </div>
          </div>
        </div>

        <div className="column is-one-third">
          <div className="card is-fullheight has-background-circles">
            <div className="card-content is-fullheight is-flex is-flex-direction-column is-justify-content-center">
              <h3 className="title mb-2">
                Token Reserve
              </h3>
              <p>The tokens used to found moderators.</p>
            </div>
          </div>
        </div>

        <div className="column is-one-third">
          <div className="card is-fullheight has-background-circles">
            <div className="card-content is-flex is-align-items-center pb-0">
              <img src={walletImg} />
              <div className="mt-3 ml-3" style={{ whiteSpace: 'nowrap', lineHeight: .5 }}>
                <p className="is-size-7 has-text-light">min 100000 tokens</p>
                <h3 className="title is-size-1 level">
                  <span>55k</span>
                  <span className="usd is-size-6 has-text-light has-text-weight-normal ml-3">MOD<br />tokens</span>
                </h3>
              </div>
            </div>
            <footer className="card-footer mb-0" style={{ border: 0 }}>
              <button className="button is-dark is-fullwidth">Buy</button>
              <button className="button is-dark is-fullwidth">Deposit</button>
            </footer>
          </div>
        </div>

        <div className="column is-one-third">
          <div className="card is-fullheight has-background-circles">
            <div className="card-content is-flex is-align-items-center pb-0">
              <img src={stakedImg} />
              <div className="mt-3 ml-3" style={{ whiteSpace: 'nowrap', lineHeight: .5 }}>
                <h3 className="title is-size-1 level">
                  <span>5</span>
                  <span className="usd is-size-6 has-text-light has-text-weight-normal ml-3">DSCVR<br />tokens</span>
                </h3>
              </div>
            </div>
            <footer className="card-footer mb-0" style={{ border: 0 }}>
              <button className="button is-dark is" style={{ width: '50%' }}>Deposit</button>
            </footer>
          </div>
        </div>

        <div className="column">
          <div className="card is-fullheight">
            <div className="card-content">
              <h3 className="subtitle mb-3 level">
                Rules
                <button className="button is-dark is" onClick={toggleEditRules}>
                  Edit Rules
                </button>
              </h3>
              <ul>
                {dummyRules.map((rule) => (
                  <li key={rule} className="is-flex is-align-items-center">
                    <span className="icon is-small has-text-primary mr-2">
                      <span className="material-icons">trending_flat</span>
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="column">
          <div className="card">
            <div className="card-content">
              <h3 className="subtitle mb-3 level">
                Moderator Settings
                <button className="button is-dark is" onClick={toggleModeratorSettings}>
                  Edit Settings
                </button>
              </h3>

              <div className="level mb-3">
                <p>Number of votes required to finalize decision:</p>
                <p className="is-size-5 has-text-white has-text-weight-bold ml-3">2</p>
              </div>
              <div className="level mb-3">
                <p>Required number of staked MOD tokens to vote:</p>
                <p className="is-size-5 has-text-white has-text-weight-bold ml-3">1000</p>
              </div>
              <div className="level mb-3">
                <p>Example cost per each succesful vote (1% of stake)</p>
                <p className="is-size-5 has-text-white has-text-weight-bold ml-3">1</p>
              </div>
              <div className="level mb-3">
                <p>Number of your platform tokens to be distributed to the majority voters (optional) </p>
                <p className="is-size-5 has-text-white has-text-weight-bold ml-3">5</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TrustedIdentities />

      {showEditApp &&
        <EditApp toggle={toggleEditApp} />
      }

      {showEditRules &&
        <EditRulesModal
          rules={dummyRules}
          toggle={toggleEditRules}
        />
      }
      {showModeratorSettings &&
        <EditModeratorSettingsModal
          toggle={toggleModeratorSettings}
        />
      }
    </>
  )
}