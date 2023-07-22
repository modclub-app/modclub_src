import * as React from 'react'
import { Card } from "react-bulma-components";
import { PohTaskData } from '../../../utils/types';

export default function ProfileDetails({ data } : { data: PohTaskData }) {
  return (
    <Card.Content>
      <table className="table is-label">
        <tbody>
          <tr>
            <td>Username:</td>
            <td>{data.userName}</td>
          </tr>
          <tr>
            <td>Full Name:</td>
            <td>{data.fullName}</td>
          </tr>
          <tr>
            <td>Email:</td>
            <td>{data.email}</td>
          </tr>
          <tr>
            <td>About bio:</td>
            <td>{data.aboutUser}</td>
          </tr>
        </tbody>
      </table>
    </Card.Content>
  )
};