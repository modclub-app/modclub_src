// import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Form, Field } from "react-final-form";
import FormModal from "../modals/FormModal";

const AddModal = ({ toggle }) => {
  const onFormSubmit = async (values: any) => {
    console.log("onFormSubmit", values);
    const { amount } = values;
    return "Add Trust Identity form submitted";
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
  )
}

const EditModal = ({ toggle }) => {
  const onFormSubmit = async (values: any) => {
    console.log("onFormSubmit", values);
    const { amount } = values;
    return "Edit Trusted Identity form submitted";
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
  )
}

const RemoveModal = ({ toggle }) => {
  const onFormSubmit = async (values: any) => {
    console.log("onFormSubmit", values);
    const { amount } = values;
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
  )
}

export default function TrustedIdentities() {
  const [checked, setChecked] = useState([]);

  const [showAdd, setAdd] = useState(false);
  const toggleAdd = () => setAdd(!showAdd);

  const [showEdit, setEdit] = useState(false);
  const toggleEdit = () => setEdit(!showEdit);

  const [showRemove, setRemove] = useState(false);
  const toggleRemove = () => setRemove(!showRemove);

  const handleCheck = (e) => {
    const item = e.target.name;
    const isChecked = e.target.checked;
    setChecked(isChecked ? [...checked, item] : checked.filter(id => id != item));
  }

  const handleCheckAll = () => {
    setChecked(["one", "tho", "three", "four"]);
  }

  return (
    <>
      <div className="card mb-6">
        <div className="card-content">
          <h3 className="title mb-2">
            Trusted identities
          </h3>
          <p className="mb-6">Add the principal IDs for other members of your team so they can manage your Modclub account</p>

          <div className="field has-background-dark p-5">

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
                <tr>
                  <td>
                    <label className="checkbox">
                      <input type="checkbox" name="one" onClick={handleCheck} />
                      <span className="check icon is-small">
                        <span className="material-icons">done</span>
                      </span>
                    </label>
                  </td>
                  <td>xhyfj-2jsdflkj-asjdfkj-ssdfa</td>
                  <td>JediMaster</td>
                  <td className="has-text-left">
                    <span className="is-clickable" onClick={toggleEdit}>Edit</span>
                    <span className="is-clickable ml-5" onClick={toggleRemove}>Remove</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label className="checkbox">
                    <input type="checkbox" name="two" onClick={handleCheck} />
                      <span className="check icon is-small">
                        <span className="material-icons">done</span>
                      </span>
                    </label>
                  </td>
                  <td>xhyfj-2jsdflkj-asjdfkj-ssdfa</td>
                  <td>JediMaster</td>
                  <td className="has-text-left">
                    <span>Edit</span>
                    <span className="ml-5">Remove</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label className="checkbox">
                    <input type="checkbox" name="three" onClick={handleCheck} />
                      <span className="check icon is-small">
                        <span className="material-icons">done</span>
                      </span>
                    </label>
                  </td>
                  <td>xhyfj-2jsdflkj-asjdfkj-ssdfa</td>
                  <td>JediMaster</td>
                  <td className="has-text-left">
                    <span>Edit</span>
                    <span className="ml-5">Remove</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label className="checkbox">
                      <input type="checkbox" name="four" onClick={handleCheck} />
                      <span className="check icon is-small">
                        <span className="material-icons">done</span>
                      </span>
                    </label>
                  </td>
                  <td>xhyfj-2jsdflkj-asjdfkj-ssdfa</td>
                  <td>JediMaster</td>
                  <td className="has-text-left">
                    <span>Edit</span>
                    <span className="ml-5">Remove</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <label className="checkbox">
                      <input type="checkbox" name="four" onClick={handleCheckAll} />
                      <span className="check icon is-small">
                        <span className="material-icons">done</span>
                      </span>
                    </label>
                  </td>
                  <td className="has-text-left">Check All</td>
                </tr>
              </tbody>
            </table>

            {/* checked? {checked} */}

            <button className="button is-danger" disabled={!checked.length}>
              Remove
            </button>

            <button className="button is-primary ml-4" onClick={toggleAdd}>
              Add new
            </button>

          </div>
        </div>
      </div>

      {showAdd &&
        <AddModal toggle={toggleAdd} />
      }

      {showEdit &&
        <EditModal toggle={toggleEdit} />
      }

      {showRemove &&
        <RemoveModal toggle={toggleRemove} />
      }
    </>
  )
}