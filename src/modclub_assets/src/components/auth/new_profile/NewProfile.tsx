import "./NewProfile.scss";
import { Form, Field } from "react-final-form";
import {  registerModerator } from "../../../utils/api";
import { useAuth } from "../../../utils/auth";
import { useHistory } from "react-router-dom";
import { useRef, useState } from "react";
import placeholder from "../../../../assets/user_placeholder.png";
import { Image, ImageData } from "../../../utils/types";

const MAX_IMAGE_SIZE = 500000; // 500kb

export default function NewProfile() {
  const history = useHistory();
  const { setUser } = useAuth();
  const [pic, setPic] = useState<string>(null);
  const [picType, setPicType] = useState<string>(null);
  const [ submitting, setSubmitting ] = useState<boolean>(false);
  const inputFile = useRef(null);

  const [message, setMessage] = useState(null);

  const handleFileChange = (e) => {
    const { files } = e.target;
    if (files.length > 0) {
      const f = files[0];
      const reader = new FileReader();
      reader.onload = function (evt) {
        console.log(evt.target.result);
        const metadata = `name: ${f.name}, type: ${f.type}, size: ${f.size}, contents:`;
        console.log(metadata);
        const data =
          typeof evt.target.result == "string" ? evt.target.result : null;
        setPic(data);
        setPicType(f.type);
      };
      reader.readAsDataURL(f);
    }
  };

  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  const onFormSubmit = async (values: any) => {
    const { username, email } = values;

    const validEmail = validateEmail(email)
    if (!validEmail) {
      setMessage({ success: false, value: "Email is badly formatted" });
      setTimeout(() => setMessage(null), 2000);
      return
    }

    setSubmitting(true);

    const imageData: ImageData = pic ? {
      src: pic,
      type: picType,
    } : undefined;
    
    const regEx = /Reject text: (.*)/g;
    try {
      const user = await registerModerator(username, email, imageData);
      console.log("user", user);
      // TODO not returning the error here!
      setUser(user);
      setMessage({ success: true, value: "Sign Up Successfull!" });
      setTimeout(() => {
        setMessage(null);
        history.push("/app");
      }, 2000);
    } catch (e) {
      let errAr = regEx.exec(e.message);  
      setMessage({ success: false, value: errAr[1] });
      setSubmitting(false);
    }

    setTimeout(() => setMessage(null), 2000);
  };

  return (
  <>
    {message &&
      <div className={`notification has-text-centered ${message.success ? "is-success" : "is-danger"}`}>
        {message.value}
      </div>
    }
    <div className="columns is-centered is-vcentered is-fullheight">
      <div className="column is-half">
        <div className="card">
          <div className="card-content has-text-centered">
            <h1 className="title">
              Create your profile
            </h1>
            <input
              style={{ display: "none" }}
              ref={inputFile}
              onChange={handleFileChange}
              accept="image/*"
              type="file"
            />
      
            <div className="profilePicture" onClick={() =>  inputFile.current.click()}>
              <img src={pic ? pic : placeholder} alt="profile" />
            </div>

            <p className="has-text-centered	mt-2 mb-5">
              Upload Profile Picture
            </p>

            <Form
              onSubmit={onFormSubmit}
              render={({ handleSubmit, values }) => (
                <form onSubmit={handleSubmit}>
                  <div className="field">
                    <div className="control has-icons-left">
                      <Field
                        name="username"
                        component="input"
                        type="text"
                        className="input is-medium"
                        placeholder="Username"
                      />
                      <span className="icon is-medium is-left">
                        <span className="material-icons">person</span>
                      </span>
                    </div>
                  </div>
                  <div className="field">
                    <div className="control has-icons-left">
                      <Field
                        name="email"
                        component="input"
                        type="text"
                        placeholder="Email"
                        className="input is-medium"
                      />
                      <span className="icon is-medium is-left">
                        <span className="material-icons">email</span>
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!values.username || !values.email || submitting}
                    className={"button is-large is-primary is-fullwidth mt-6 " + (submitting ? "is-loading" : "")}
                    value="Submit"
                  >Submit</button>
                </form>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  </>
  );
}
