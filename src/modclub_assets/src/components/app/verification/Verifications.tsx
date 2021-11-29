import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../utils/auth";
import { getAllContent } from "../../../utils/api";
import { Columns, Card, Dropdown, Level, Progress, Heading, Button, Icon } from "react-bulma-components";
import Userstats from "../userstats/Userstats";
import ApproveReject from "../modals/ApproveReject"
import { fileToImgSrc, formatDate, imageToUint8Array, unwrap } from "../../../utils/util";
import { Image__1 } from "../../../utils/types";


const FilterBar = () => {
  const apps = ["App One", "App Two", "App Three"];

  return (
    <Card className="mb-5">
      <Card.Content>
        <Level justifyContent="start">
        <p className="mr-4">
          Choose your favorite app:
        </p>

        <Dropdown
          hoverable
          label="All App's"
          icon={
            <Icon color="white">
              <span className="material-icons">expand_more</span>
            </Icon>
          }
          style={{ width: 100 }}
        >
          {apps.map((app) => (
            <Dropdown.Item key={app} value={app} renderAs="a">
              {app}
            </Dropdown.Item>
          ))}
        </Dropdown>

        <Button.Group className="ml-6">
          <Button color="primary">
            Completed
          </Button>
          <Button color="ghost" className="has-text-white">
            Newest
          </Button>
          <Button color="ghost" className="has-text-white">
            Most Voted
          </Button>
          <Button color="ghost" className="has-text-white">
            Less Voted
          </Button>
        </Button.Group>

        </Level>
      </Card.Content>
    </Card>
  );
};

const Applicant = ({ image, name, job, platform, submitted, required, reward }) => {

  return (
    <Card style={{
      background: `linear-gradient(to bottom, rgba(0,0,0,0) 0, rgba(0,0,0,1) 70%),
      url(${image}) no-repeat top center`
    }}>
      <Card.Header>
        <Progress value={15} max={100} />
        <span className="progress-label" style={{ left: "1.5rem" }}>10/15 votes</span>
      </Card.Header>

      <Card.Content style={{ paddingTop: "50%" }}>
        <Link to={`/app/verifications/${123}`} className="subtitle mb-0">
          {name}
        </Link>
        <p className="is-size-7 mt-2">
          {job}
        </p>
      </Card.Content>
      
      <Card.Footer className="is-block mb-0">
        <Card.Header.Title>
          {platform}
          <span>Submitted {submitted}</span>
        </Card.Header.Title>

        <Button.Group className="is-flex-wrap-nowrap mt-5">
          <Button fullwidth className="is-outlined">
            <Icon align="left" size="small" className="has-text-white ml-1 mr-2">
              <span className="material-icons">local_atm</span>
            </Icon>
            <span>{"Rq Stake: " + required}</span>
          </Button>
          <Button fullwidth className="is-outlined">
            <Icon align="left" size="small" className="has-text-white ml-1 mr-2">
              <span className="material-icons">stars</span>
            </Icon>
            <span>{"Reward: "+ reward}</span>
          </Button>
        </Button.Group>

      </Card.Footer>
    </Card>
  )
}

export default function Verifications() {

  const applicants = [
    {
      image:"https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg",
      name: "Joe Smith",
      job: "Frelance Designer",
      platform: "Tumblr",
      submitted: "38 min ago",
      required: 655,
      reward: 5,
    },
    {
      image:"https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg",
      name: "Joe Smith",
      job: "Frelance Designer",
      platform: "Tumblr",
      submitted: "38 min ago",
      required: 655,
      reward: 5,
    },
    {
      image:"https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg",
      name: "Joe Smith",
      job: "Frelance Designer",
      platform: "Tumblr",
      submitted: "38 min ago",
      required: 655,
      reward: 5,
    },
    {
      image:"https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg",
      name: "Joe Smith",
      job: "Frelance Designer",
      platform: "Tumblr",
      submitted: "38 min ago",
      required: 655,
      reward: 5,
    }
  ]
  const { user } = useAuth();
  const [content, setContent] = useState(null);

  const renderContent = async () => {
  }

  useEffect(() => {
    user && renderContent();
  }, [user]);
  
  return (
    <>
      <Userstats />

      <FilterBar />

      <Columns className="mb-5">
        {applicants.map((applicant) => (
          <Columns.Column size={4}>
            <Applicant
              image={applicant.image}
              name={applicant.name}
              job={applicant.job}
              platform={applicant.platform}
              submitted={applicant.submitted}
              required={applicant.required}
              reward={applicant.reward}
            />
          </Columns.Column>
        ))}
      </Columns>
    </>
  )
}