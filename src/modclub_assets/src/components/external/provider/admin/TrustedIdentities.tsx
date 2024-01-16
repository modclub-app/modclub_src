import * as React from "react";
import { useState, useEffect } from "react";
import { Card, Heading, Button, Icon } from "react-bulma-components";
import { Field } from "react-final-form";
import FormModal from "../../../app/modals/FormModal";

import { Link } from "react-router-dom";

import { Principal } from "@dfinity/principal";
import {
  addProviderAdmin,
  useActors,
  removeProviderAdmin,
  editProviderAdmin,
} from "../../../../utils";
import {
  useAppState,
  useAppStateDispatch,
} from "../../../app/state_mgmt/context/state";

const principalIDValidationForInput = (ID, principalIDS) => {
  console.log("principalIDS", principalIDS);

  if (
    principalIDS.filter(function (e) {
      return e.id === ID;
    }).length > 0
  )
    return false;

  return true;
};

const principalIDValidationForEditAndRemove = (ID, principalIDS) => {
  // if (ID.length !== 28) return false;   - CHECK THIS

  if (
    principalIDS.filter(function (e) {
      return e.id === ID;
    }).length > 0
  )
    return true;

  return false;
};

const AddModal = ({ toggle, principalIDS, setPrincipleIDs }) => {
  const { modclub } = useActors();
  const appState = useAppState();
  const onFormSubmit = async (values: any) => {
    if (
      principalIDValidationForInput(values.id, principalIDS) &&
      modclub &&
      (await addProviderAdmin(
        modclub,
        Principal.fromText(values.id),
        appState.selectedProvider.id,
        values.userName
      ))
    ) {
      values.id = Principal.fromText(values.id);
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

const EditModal = ({
  toggle,
  principalIDS,
  setPrincipleIDs,
  userId,
  userName,
}) => {
  const { modclub } = useActors();
  const appState = useAppState();
  const onFormSubmit = async (values: any) => {
    console.log("onFormSubmit", values);
    const { amount } = values;
    if (principalIDValidationForEditAndRemove(values.id, principalIDS)) {
      let items = [...principalIDS];
      let index = principalIDS.findIndex(function (e) {
        return e.id === values.id;
      });
      items[index].userName = values.userName;

      if (
        modclub &&
        (await editProviderAdmin(
          modclub,
          values.id,
          appState.selectedProvider.id,
          values.userName
        ))
      ) {
        setPrincipleIDs([...items]);
        return "Edit Trusted Identity form submitted";
      }
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
            initialValue={userId}
            placeholder="Principal ID"
            disabled={true}
          />
        </div>
        <div className="field">
          <Field
            name="userName"
            component="input"
            type="text"
            className="input"
            initialValue={userName}
            placeholder="User Name"
          />
        </div>
      </div>
    </FormModal>
  );
};

const RemoveModal = ({ toggle, principalIDS, setPrincipleIDs, toRemove }) => {
  const { modclub } = useActors();
  const appState = useAppState();
  const onFormSubmit = async (values: any) => {
    console.log(values);
    let items = [...principalIDS];
    let index = principalIDS.findIndex(function (e) {
      return e.id === toRemove;
    });
    items[index].userName = values.userName;
    items.splice(index, 1);
    if (
      modclub &&
      (await removeProviderAdmin(
        modclub,
        toRemove,
        appState.selectedProvider.id
      ))
    ) {
      setPrincipleIDs([...items]);
      return "Remove Trusted Identity form submitted";
    }
    return "Values entered not valid";
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
  const { modclub } = useActors();
  const appState = useAppState();
  const dispatch = useAppStateDispatch();
  const [checked, setChecked] = useState([]);

  const [showAdd, setAdd] = useState(false);
  const toggleAdd = () => setAdd(!showAdd);

  const [showEdit, setEdit] = useState(false);
  const [editUserId, setEditUserId] = useState("");
  const [editUserName, setEditUserName] = useState("");
  const toggleEdit = (userId, userName) => {
    setEditUserId(
      typeof userId == "string" ? Principal.fromText(userId) : userId
    );
    setEditUserName(userName);
    setEdit(!showEdit);
  };

  const [showRemove, setRemove] = useState(false);
  const toggleRemove = (id) => {
    setRemove(!showRemove);
    setEntryToRemove(id);
  };

  const [entryToRemove, setEntryToRemove] = useState("");

  const [trustedPrincipleIDs, setTrustedPrincipleIDs] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    let trustedIdentitiesInit = async () => {
      if (modclub && appState.selectedProvider?.id) {
        let allProfiles = await modclub.getProviderAdmins(
          appState.selectedProvider?.id
        );
        setTrustedPrincipleIDs(allProfiles);
      }
      return () => controller.abort();
    };
    trustedIdentitiesInit();
  }, [appState.selectedProvider?.id?.toText(), modclub]);

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

  return (
    <>
      {appState.selectedProvider != null && (
        <Card>
          <Card.Content>
            <Heading className="mb-2">Trusted identities</Heading>

            <p className="mb-6">
              Add the principal IDs for other members of your team so they can
              manage your Modclub account <br />
              To get principal ID please visit this{" "}
              <Link to="/admin-identity">page</Link>
            </p>

            <div
              className="has-background-dark p-5"
              style={{ borderRadius: 4 }}
            >
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
                      <tr key={item.id}>
                        <td>
                          {/* <label className="checkbox">
                          <input
                            type="checkbox"
                            id={typeof item.id == "string" ? item.id : item.id.toText()}
                            onClick={handleCheck}
                          />
                          <Icon size="small" className="check">
                            <span className="material-icons">done</span>
                          </Icon>
                        </label> */}
                        </td>
                        <td>
                          {typeof item.id == "string"
                            ? item.id
                            : item.id.toText()}
                        </td>
                        <td>{item.userName}</td>
                        <td className="has-text-left">
                          {/* <span className="is-clickable" onClick={() => {
                          toggleEdit(item.id, item.userName)
                        }}>
                          Edit
                        </span> */}
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
                    {/* <tr>
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
                  </tr> */}
                  </tbody>
                </table>
              </div>
              <Button.Group>
                {/* <Button color="danger" disabled={!checked.length}>
                Remove
              </Button> */}
                <Button color="primary" onClick={toggleAdd}>
                  Add new
                </Button>
              </Button.Group>
            </div>
          </Card.Content>
        </Card>
      )}
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
          userId={editUserId}
          userName={editUserName}
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
