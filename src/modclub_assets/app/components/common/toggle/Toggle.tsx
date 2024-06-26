import * as React from "react";
import { Field } from "react-final-form";

export default function Toggle({ id, label }) {
  return (
    <div className="field level is-relative is-toggle">
      <Field name={id} component="input" type="checkbox" value={id} id={id} />
      <label htmlFor={id} className="is-clickable" style={{ width: "90%" }}>
        {label}
      </label>
    </div>
  );
}
