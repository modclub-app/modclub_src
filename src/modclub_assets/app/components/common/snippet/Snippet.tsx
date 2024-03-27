import * as React from "react";
import { Link } from "react-router-dom";
type Props = {
  string?: string;
  truncate?: number;
  linkId?: string;
  isPoh: boolean;
};

export default function Snippet(props: Props) {
  return props && props.string && props.string.length > props.truncate ? (
    <div className="dropdown is-hoverable is-up">
      <div className="dropdown-trigger">
        {props.isPoh || !props.linkId ? (
          props.string.substring(0, props.truncate - 5) + "..."
        ) : (
          <Link style={{ color: "#c4c4c4" }} to={`${props.linkId}`}>
            {props.string.substring(0, props.truncate - 5) + "..."}
          </Link>
        )}
      </div>
      <div className="dropdown-menu" role="menu">
        <div className="dropdown-content p-0">
          <div
            className="dropdown-item has-text-white"
            style={{ padding: "0.375rem", fontSize: 11 }}
          >
            {props.isPoh || !props.linkId ? (
              props.string || ""
            ) : (
              <Link style={{ color: "#c4c4c4" }} to={`${props.linkId}`}>
                {props.string || ""}
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <>{props.string}</>
  );
}
