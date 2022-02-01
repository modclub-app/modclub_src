import * as React from 'react'
import { Card, Icon } from "react-bulma-components";
import { Field } from "react-final-form";

export default function Confirm({
  type,
  id,
  label
} : {
  type: string,
  id: string,
  label: string
}) {
  return (
    <Card className="confirm mt-5" backgroundColor={type}>
      <Card.Content>
        <label className="checkbox is-large level" style={{ color: "#fff", fontWeight: 600, width: "100%" }}>
          {label}
          <Field
            name={id}
            component="input"
            type="checkbox"
            value={id}
            id={id}
          />
          <Icon className="check">
            <span className="material-icons">done</span>
          </Icon>
        </label>
      </Card.Content>
    </Card>
  )
}