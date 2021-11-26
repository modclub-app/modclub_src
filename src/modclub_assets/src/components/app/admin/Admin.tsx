import { Field } from "react-final-form";
import { useEffect, useState } from "react";
import { Columns, Card, Button, Level, Heading, Icon } from "react-bulma-components";
import FormModal from "../modals/FormModal";
import TrustedIdentities from "../trusted_identities/TrustedIdentities";
import walletImg from '../../../../assets/wallet.svg';
import stakedImg from '../../../../assets/staked.svg';

const EditAppModal = ({ toggle }) => {  
  const onFormSubmit = async (values: any) => {
    console.log("onFormSubmit parent!", values)
    const { address, amount } = values;
    return "EditAppModal success return";
  };

  return (
    <FormModal
      title="Edit App"
      toggle={toggle}
      handleSubmit={onFormSubmit}
    >
      <div className="field">
        <div className="control">
          <Field
            name="name"
            component="input"
            type="text"
            className="input"
            placeholder="App Name"
          />
        </div>
      </div>

      <div className="field">
        <div className="control">
          <Field
            name="description"
            component="textarea"
            className="textarea"
            placeholder="App Description"
          />
        </div>
      </div>
    </FormModal>
  );
};

const EditRulesModal = ({ rules, toggle }) => {
  const [newRules, setNewRules] = useState(rules);

  const remove = (rule) => {
    setNewRules(newRules.filter(item => item !== rule));
  }

  const add = (rule) => {
    rule && setNewRules([...newRules, rule]);
  }

  const onFormSubmit = async () => {
    console.log("parent !!! onFormSubmit newRules", newRules);
    return newRules;
  };

  return (
    <FormModal
      title="Edit Rules"
      toggle={toggle}
      handleSubmit={onFormSubmit}
    >
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
        
        {/* <span className="icon has-text-success ml-3" onClick={() => [add(values.newRule), values.newRule = null]}>
          {values.newRule && <span className="material-icons is-clickable">add_circle</span>}
        </span> */}
        
      </div>
    </FormModal>
  )
}

const EditModeratorSettingsModal = ({ toggle }) => {
  // const [ submitting, setSubmitting ] = useState<boolean>(false);

  const onFormSubmit = async (values: any) => {
    console.log("parent !!! onFormSubmit values", values);
    return "EditModeratorSettings Success!";
  };

  return (
    <FormModal
      title="Edit Moderator Settings"
      toggle={toggle}
      handleSubmit={onFormSubmit}
    >
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
    </FormModal>
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
    <Columns>
      <Columns.Column>
        <Card className="is-fullheight">
          <Card.Content className="columns">

            <Columns.Column>
              <Card className="has-gradient">
                <Card.Content className="py-6">
                  <Heading className="has-text-centered">
                  DSCVR<br/>logo
                  </Heading>
                </Card.Content>
              </Card>
            </Columns.Column>

            <Columns.Column>
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
              <Button color="dark" onClick={toggleEditApp}>
                Edit App
              </Button>
            </Columns.Column>
          </Card.Content>
        </Card>
      </Columns.Column>

      <Columns.Column size={4}>
        <Card className="is-fullheight">
          <Card.Content>
            <Heading subtitle>
              Stats
            </Heading>
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
          </Card.Content>
        </Card>
      </Columns.Column>

      <Columns.Column size={4}>
        <Card backgroundColor="circles" className="is-fullheight">
          <Card.Content>
            <Heading className="mb-2">
              Token Reserve
            </Heading>
            <p>The tokens used to found moderators.</p>
          </Card.Content>
        </Card>
      </Columns.Column>

      <Columns.Column size={4}>
        <Card backgroundColor="circles" className="is-fullheight">
          <Card.Content className="is-flex is-align-items-center pb-0">
            <img src={walletImg} />
            <div className="mt-3 ml-3" style={{ whiteSpace: "nowrap", lineHeight: .5 }}>
              <p className="is-size-7 has-text-light">min 100000 tokens</p>
              <Heading size={1} className="level">
                <span>55k</span>
                <span className="is-size-6 has-text-light has-text-weight-normal ml-3">MOD<br />tokens</span>
              </Heading>
            </div>
          </Card.Content>
          <Card.Footer className="mb-0" style={{ border: 0 }}>
            <Button color="dark" className="is-fullwidth">
              Buy
            </Button>
            <Button color="dark" className="is-fullwidth">
              Deposit
            </Button>
          </Card.Footer>
        </Card>
      </Columns.Column>

      <Columns.Column size={4}>
        <Card backgroundColor="circles" className="is-fullheight">
          <Card.Content className="is-flex is-align-items-center pb-0">
            <img src={stakedImg} />
            <div className="mt-3 ml-3" style={{ whiteSpace: "nowrap", lineHeight: .5 }}>
              <Heading size={1} className="level">
                <span>5</span>
                <span className="is-size-6 has-text-light has-text-weight-normal ml-3">DSCVR<br />tokens</span>
              </Heading>
            </div>
          </Card.Content>
          <Card.Footer className="mb-0" style={{ border: 0 }}>
            <Button color="dark" style={{ width: "50%" }}>
              Deposit
            </Button>
          </Card.Footer>
        </Card>
      </Columns.Column>

      <Columns.Column size={6}>
        <Card className="is-fullheight">
          <Card.Header>
            <Card.Header.Title textSize={5}>
            Rules
            </Card.Header.Title>
            <Button color="dark" onClick={toggleEditRules}>
              Edit Rules
            </Button>
          </Card.Header>
          <Card.Content>
            <table className="table is-striped has-text-left">
              <tbody>
                {dummyRules.map((rule) => (
                  <tr key={rule}>
                    <td className="has-text-left">{rule}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card.Content>
        </Card>
      </Columns.Column>

      <Columns.Column size={6}>
        <Card className="is-fullheight">
          <Card.Header>
            <Card.Header.Title textSize={5}>
              Moderator Settings
            </Card.Header.Title>
            <Button color="dark" onClick={toggleModeratorSettings}>
              Edit Settings
            </Button>
          </Card.Header>
          <Card.Content>
            <table className="table is-striped has-text-left">
              <tbody>
                <tr>
                  <td>Number of votes required to finalize decision:</td>
                  <td className="has-text-white is-size-5 has-text-weight-bold">2</td>
                </tr>
                <tr>
                  <td>Required number of staked MOD tokens to vote:</td>
                  <td className="has-text-white is-size-5 has-text-weight-bold">1000</td>
                </tr>
                <tr>
                  <td>Example cost per each succesful vote (1% of stake)</td>
                  <td className="has-text-white is-size-5 has-text-weight-bold">1</td>
                </tr>
                <tr>
                  <td>Number of your platform tokens to be distributed to the majority voters (optional)</td>
                  <td className="has-text-white is-size-5 has-text-weight-bold">5</td>
                </tr>
              </tbody>
            </table>
          </Card.Content>
        </Card>
      </Columns.Column>      
    </Columns>

    <TrustedIdentities />

    {showEditApp &&
      <EditAppModal toggle={toggleEditApp} />
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