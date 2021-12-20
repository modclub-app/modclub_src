import { Dropdown, Icon } from "react-bulma-components";

type Props = {
  string?: string;
  truncate?: number;
};

const DropdownLabel = ({ props }) => {
  return (
    <span style={{ color: "white" }}>
      {props.string.substring(0, props.truncate - 5) + '...'}
    </span>
  )
};

export default function Snippet(props: Props) {
  // return props.string.length > props.truncate ? (
  //   <Dropdown
  //     hoverable
  //     color="ghost"
  //     label={<DropdownLabel props={props}/>}
  //     style={{ color: "white" }}
  //   >
  //     <Dropdown.Item renderAs="a" value="item">
  //       {props.string}
  //     </Dropdown.Item>
  //   </Dropdown>
  // ) : (
  //   <>{props.string}</>
  // )


  return props.string.length > props.truncate ? (
    <div className="dropdown is-hoverable">
      <div className="dropdown-trigger">
        {props.string.substring(0, props.truncate - 5) + '...'}
      </div>
      <div
        className="dropdown-menu"
        role="menu"
        style={{
          paddingTop: 0,
          top: "35%",
          left: "50%"
        }}>
        <div className="dropdown-content p-0">
          <div className="dropdown-item has-text-white" style={{ padding: "0.375rem" }}>
            {props.string}
          </div>
        </div>
      </div>
    </div>) : (
      <>{props.string}</>
    )
}