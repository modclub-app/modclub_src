import React from "react";
import { Data } from "../types";

const defaultContext = {
  title: "",
  subTitle: "",
  paragraph: [],
  list: [],
};
export const PoliciesContext = React.createContext<Data>(defaultContext);
