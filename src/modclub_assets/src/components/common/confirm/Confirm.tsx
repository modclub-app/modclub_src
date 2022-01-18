import { Card, Icon } from "react-bulma-components";
import { Field } from "react-final-form";
import "./Confirm.scss";

export default function Confirm({
  color,
  id,
  label
} : {
  color: string,
  id: string,
  label: string
}) {
  return (
    <Card className="confirm mt-5" style={{ backgroundColor: color }}>
      <Card.Content>
        <Field
          name={id}
          component="input"
          type="checkbox"
          value={id}
          id={id}
        />
        <span className="check">
          <Icon>
            <span className="material-icons">done</span>
          </Icon>
        </span>
        <label htmlFor={id} className="is-clickable" style={{ color: "#fff", fontWeight: 600 }}>
          {label}
        </label>
      </Card.Content>
    </Card>
  )
}