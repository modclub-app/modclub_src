import * as React from "react";
import { useState, useEffect } from "react";
import { Card, Heading, Button, Icon } from "react-bulma-components";
import { Field } from "react-final-form";
import FormModal from "../modals/FormModal";

import { Link } from "react-router-dom";

import { addProviderAdmin } from "../../../utils/api";
import { Principal } from "@dfinity/principal";

const principalIDValidationForInput = (ID, principalIDS) => {
  if (
    principalIDS.filter(function (e) {
      return e.id === ID;
    }).length > 0
  )
    return false;

  return true;
};

const principalIDValidationForEditAndRemove = (ID, principalIDS) => {
  if (ID.length !== 28) return false;

  if (
    principalIDS.filter(function (e) {
      return e.id === ID;
    }).length > 0
  )
    return true;

  return false;
};

const AddModal = ({ toggle, principalIDS, setPrincipleIDs }) => {
  const onFormSubmit = async (values: any) => {
    console.log("onFormSubmit", values);
    if (
      principalIDValidationForInput(values.id, principalIDS) &&
      (await addProviderAdmin(Principal.fromText(values.id)))
    ) {
      setPrincipleIDs([...principalIDS, values]);
      return "Add Trust Identity form submitted";
    }

    return "Values entered not valid";
  };

  return (
    <FormModal
      title="Add Trusted Identify"
      toggle={toggle}
      handleSubmit={onFormSubmit}
    >
      <div className="has-background-dark p-5" style={{ borderRadius: 4 }}>
        <div className="field">
          <Field
            name="id"
            component="input"
            type="text"
            className="input"
            placeholder="Principal ID"
          />
        </div>
        <div className="field">
          <Field
            name="userName"
            component="input"
            type="text"
            className="input"
            placeholder="User Name"
          />
        </div>
      </div>
    </FormModal>
  );
};

const EditModal = ({ toggle, principalIDS, setPrincipleIDs }) => {
  const onFormSubmit = async (values: any) => {
    console.log("onFormSubmit", values);
    const { amount } = values;
    if (principalIDValidationForEditAndRemove(values.id, principalIDS)) {
      let items = [...principalIDS];
      let index = principalIDS.findIndex(function (e) {
        return e.id === values.id;
      });
      items[index].userName = values.userName;
      setPrincipleIDs([...items]);
      return "Edit Trusted Identity form submitted";
    }
    return "Values entered not valid";
  };

  return (
    <FormModal
      title="Edit Trusted Identify"
      toggle={toggle}
      handleSubmit={onFormSubmit}
    >
      <div className="has-background-dark p-5" style={{ borderRadius: 4 }}>
        <div className="field">
          <Field
            name="id"
            component="input"
            type="text"
            className="input"
            placeholder="Principal ID"
          />
        </div>
        <div className="field">
          <Field
            name="userName"
            component="input"
            type="text"
            className="input"
            placeholder="User Name"
          />
        </div>
      </div>
    </FormModal>
  );
};

const RemoveModal = ({ toggle, principalIDS, setPrincipleIDs, toRemove }) => {
  const onFormSubmit = async (values: any) => {
    let items = [...principalIDS];
    let index = principalIDS.findIndex(function (e) {
      return e.id === toRemove;
    });
    items[index].userName = values.userName;
    items.splice(index, 1);
    setPrincipleIDs([...items]);
    return "Remove Trusted Identity form submitted";
  };

  return (
    <FormModal
      title="Remove Trusted Identify"
      toggle={toggle}
      handleSubmit={onFormSubmit}
    >
      <p>Are you really sure?</p>
    </FormModal>
  );
};

export default function TrustedIdentities() {
  const [checked, setChecked] = useState([]);

  const [showAdd, setAdd] = useState(false);
  const toggleAdd = () => setAdd(!showAdd);

  const [showEdit, setEdit] = useState(false);
  const toggleEdit = () => setEdit(!showEdit);

  const [showRemove, setRemove] = useState(false);
  const toggleRemove = (id) => {
    setRemove(!showRemove);
    setEntryToRemove(id);
  };

  const [entryToRemove, setEntryToRemove] = useState("");

  const [trustedPrincipleIDs, setTrustedPrincipleIDs] = useState([]);

  const handleCheck = (e) => {
    const item = e.target.id;
    const isChecked = e.target.checked;
    setChecked(
      isChecked ? [...checked, item] : checked.filter((id) => id != item)
    );
  };

  const handleCheckAll = () => {
    setChecked([...checked, trustedPrincipleIDs]);
  };

  const dummyData = [
    { id: "xhyfj-2jsdflkj-asjdfkj-ssdfa", name: "Jedi Master" },
    { id: "xhyfj-2jsdflkj-asjdfkj-ssdfa", name: "Jedi Master" },
    { id: "xhyfj-2jsdflkj-asjdfkj-ssdfa", name: "Jedi Master" },
    { id: "xhyfj-2jsdflkj-asjdfkj-ssdfa", name: "Jedi Master" },
    { id: "xhyfj-2jsdflkj-asjdfkj-ssdfa", name: "Jedi Master" },
    { id: "xhyfj-2jsdflkj-asjdfkj-ssdfa", name: "Jedi Master" },
    { id: "xhyfj-2jsdflkj-asjdfkj-ssdfa", name: "Jedi Master" },
    { id: "xhyfj-2jsdflkj-asjdfkj-ssdfa", name: "Jedi Master" },
  ];

  return (
    <>
      <Card>
        <Card.Content>
          <Heading className="mb-2">Trusted identities</Heading>

          <p className="mb-6">
            Add the principal IDs for other members of your team so they can
            manage your Modclub account <br />
            To get principal ID please visit this{" "}
            <Link to="/admin-identity">page</Link>
          </p>

          <div className="has-background-dark p-5" style={{ borderRadius: 4 }}>
            <div className="table-container">
              <table className="table is-striped has-text-left is-checked">
                <thead>
                  <tr>
                    <th></th>
                    <th>Principal ID</th>
                    <th>Name</th>
                    <th className="has-text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trustedPrincipleIDs.map((item) => (
                    <tr>
                      <td>
                        <label className="checkbox">
                          <input
                            type="checkbox"
                            id={item.id}
                            onClick={handleCheck}
                          />
                          <Icon size="small" className="check">
                            <span className="material-icons">done</span>
                          </Icon>
                        </label>
                      </td>
                      <td>{item.id}</td>
                      <td>{item.userName}</td>
                      <td className="has-text-left">
                        <span className="is-clickable" onClick={toggleEdit}>
                          Edit
                        </span>
                        <span
                          className="is-clickable ml-5"
                          onClick={() => {
                            toggleRemove(item.id);
                          }}
                        >
                          Remove
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td>
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          name="four"
                          onClick={handleCheckAll}
                        />
                        <span className="check icon is-small">
                          <span className="material-icons">done</span>
                        </span>
                      </label>
                    </td>
                    <td className="has-text-left">Check All</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Button.Group>
              <Button color="danger" disabled={!checked.length}>
                Remove
              </Button>
              <Button color="primary" onClick={toggleAdd}>
                Add new
              </Button>
            </Button.Group>
          </div>
        </Card.Content>
      </Card>

      {showAdd && (
        <AddModal
          toggle={toggleAdd}
          principalIDS={trustedPrincipleIDs}
          setPrincipleIDs={setTrustedPrincipleIDs}
        />
      )}
      {showEdit && (
        <EditModal
          toggle={toggleEdit}
          principalIDS={trustedPrincipleIDs}
          setPrincipleIDs={setTrustedPrincipleIDs}
        />
      )}
      {showRemove && (
        <RemoveModal
          toggle={toggleRemove}
          principalIDS={trustedPrincipleIDs}
          setPrincipleIDs={setTrustedPrincipleIDs}
          toRemove={entryToRemove}
        />
      )}
    </>
  );
}
