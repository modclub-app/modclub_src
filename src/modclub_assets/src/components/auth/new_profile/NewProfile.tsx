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

  const onFormSubmit = async (values: any) => {
    const { username, email } = values;
    if (!username) {
      console.error("Please enter a username");
      return;
    }
    setSubmitting(true);
    const imageData: ImageData = pic ? {
      src: pic,
      type: picType,
    } : undefined;

    const user = await registerModerator(username, email, imageData );
    if (user) {
      setUser(user);
      history.push("/app");
    } else {
      setSubmitting(false);
      console.error("Error creating user");
    }
  };

  return (
    <div
      className="columns is-centered is-vcentered"
      style={{ height: "100%" }}
    >
      <div className="column is-half">
        <div className="card py-5 is-flex is-justify-content-center">
          <div className="profileSection">
            <h1 className="title">Create your profile</h1>
            <input
                  style={{ display: "none" }}
                  ref={inputFile}
                  onChange={handleFileChange}
                  accept="image/*"
                  type="file"
                />
            <div className="imageContainer">
      
              <div className="profilePicture" onClick={() =>  inputFile.current.click()}>
           
                <img src={pic ? pic : placeholder} alt="profile" />
              </div>
          
              <p className="is-size-6 has-text-centered	mt-2 mb-5">
                Upload Profile Picture
              </p>
            </div>
            <Form
              onSubmit={onFormSubmit}
              render={({ handleSubmit, form }) => (
                <form onSubmit={handleSubmit}>
                  <div className="field">
                    <div className="control has-icons-left has-icons-right">
                      <Field
                        name="username"
                        component="input"
                        type="text"
                        className="input is-medium"
                        placeholder="Username"
                      />
                      <span className="icon is-medium is-left">
                        <i className="fas fa-user"></i>
                      </span>
                    </div>
                  </div>
                  <div className="field">
                    <div className="control has-icons-left has-icons-right">
                      <Field
                        name="email"
                        component="input"
                        type="text"
                        placeholder="Email"
                        className="input is-medium"
                      />
                      <span className="icon is-medium is-left">
                        <i className="fas fa-envelope"></i>
                      </span>
                    </div>
                  </div>
                  <div className="inputField">
                    <button
                      type="submit"
                      disabled={submitting}
                      className={"button is-large is-primary is-fullwidth mt-6 " + (submitting ? "is-loading" : "")}
                      value="Submit"
                    >Submit</button>
                  </div>
                </form>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
