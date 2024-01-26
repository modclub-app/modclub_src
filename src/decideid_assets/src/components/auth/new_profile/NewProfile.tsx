import * as React from "react";
import { useEffect, useState } from "react";
import { Field, Form } from "react-final-form";
import {
  Block,
  Button,
  Card,
  Columns,
  Heading,
  Icon,
  Notification,
} from "react-bulma-components";
import { KEY_LOCALSTORAGE_USER } from "../../../contexts/profile";
import { useHistory } from "react-router-dom";
import { setUserToStorage, validateEmail } from "../../../utils/util";
import { useActors } from "../../../hooks/actors";
import logger from "../../../utils/logger";
import { GTMEvent, GTMManager } from "../../../utils/gtm";

export default function NewProfile({ isPohFlow }: { isPohFlow: boolean }) {
  return (<>
    New profile
    </>
  );
}
