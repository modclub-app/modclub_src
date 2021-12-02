// import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Columns, Card, Heading, Button } from "react-bulma-components";

export default function Moderators() {
  const [content, setContent] = useState(null);

  useEffect(() => {
  }, []);

  const dummyData = [
    { id: 483250, name: "Joe Smit",  voted: 421, received: "3000 MOD", rewards: "3000 DSCVR", date: "10/09/2021" },
    { id: 483250, name: "Joe Smit",  voted: 421, received: "3000 MOD", rewards: "3000 DSCVR", date: "10/09/2021" },
    { id: 483250, name: "Joe Smit",  voted: 421, received: "3000 MOD", rewards: "3000 DSCVR", date: "10/09/2021" },
    { id: 483250, name: "Joe Smit",  voted: 421, received: "3000 MOD", rewards: "3000 DSCVR", date: "10/09/2021" },
    { id: 483250, name: "Joe Smit",  voted: 421, received: "3000 MOD", rewards: "3000 DSCVR", date: "10/09/2021" },
    { id: 483250, name: "Joe Smit",  voted: 421, received: "3000 MOD", rewards: "3000 DSCVR", date: "10/09/2021" },
    { id: 483250, name: "Joe Smit",  voted: 421, received: "3000 MOD", rewards: "3000 DSCVR", date: "10/09/2021" },
  ]
  
  return (
    <Columns>
      <Columns.Column size={12}>
        <Card>
          <Card.Content>
            <Heading>
              Moderators
            </Heading>
          </Card.Content>
        </Card>
      </Columns.Column>

      <Columns.Column size={12}>
        <Card>
          <Card.Content>
            <Heading subtitle>
              Most active moderators
            </Heading>

            <div className="table-container">
              <table className="table is-striped">
                <thead>
                  <tr>
                    <th>MODID</th>
                    <th>Name</th>
                    <th>Voted amt</th>
                    <th>Reward received</th>
                    <th>Platform rewards</th>
                    <th>Last voted</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {dummyData.map((item) => (
                    <tr>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{item.voted}</td>
                      <td>{item.received}</td>
                      <td>{item.rewards}</td>
                      <td>{item.date}</td>
                      <td>
                        <Button color="gradient" size="small" fullwidth>
                          Flag
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Content>
        </Card>
      </Columns.Column>
    </Columns>
  )
}