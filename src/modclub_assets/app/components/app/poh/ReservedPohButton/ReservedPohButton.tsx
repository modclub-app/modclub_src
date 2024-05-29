import * as React from "react";
import { Link } from "react-router-dom";
import { Card } from "react-bulma-components";
import { formatDate } from "../../../../utils/util";
import placeholder from "../../../../../assets/user_stub_logo.png";

// Styles
import classNames from "classnames/bind";
import styles from "./styles.scss";
const cn = classNames.bind(styles);

interface ReservedButton {
  packageId: string;
  Text?: string;
  imageUrl: string;
  urlObject: any;
  createdAt: any;
  isEnable: boolean;
}

export const ReservedPohButton = ({
  packageId,
  isEnable,
  Text,
  imageUrl,
  urlObject,
  createdAt,
}: ReservedButton) => {
  return (
    <Link
      to={`/app/poh/${packageId}`}
      className="card is-flex is-flex-direction-column is-justify-content-flex-end"
      onClick={isEnable ? undefined : (event) => event.preventDefault()}
    >
      <img src={`${imageUrl ? urlObject : placeholder}`} alt="user_preview" />

      <div className="dateTimeContainer">
        <div className="submittedDateTime">
          Submitted {formatDate(createdAt)}
        </div>
      </div>
    </Link>
  );
};
