import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../utils/auth";
import { getAllContent } from "../../../utils/api";
import {
  Heading,
  Columns,
  Card,
  Dropdown,
  Level,
  Button,
  Icon,
  Notification
} from "react-bulma-components";
import Progress from "../../common/progress/Progress";
import Userstats from "../profile/Userstats";

const FilterBar = () => {
  const [currentFilter, setCurrentFilter] = useState<string>("All");
  const filters = ["All", "Newest", "Most Voted", "Less Voted"];
  
  const apps = ["App One", "App Two", "App Three"];

  return (
    <Card style={{ overflow: "visible" }}>
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
            {apps.map(app => 
              <Dropdown.Item key={app} value={app} renderAs="a">
                {app}
              </Dropdown.Item>
            )}
          </Dropdown>

          <Dropdown
            className="ml-5 is-hidden-desktop"
            hoverable
            label="Filter"
            icon={
              <Icon color="white">
                <span className="material-icons">expand_more</span>
              </Icon>
            }
            style={{ width: 100 }}
          >
            {filters.map(filter => 
              <Dropdown.Item key={filter} value={filter} renderAs="a">
                {filter}
              </Dropdown.Item>
            )}
          </Dropdown>

          <Button.Group className="ml-5 is-hidden-mobile is-hidden-tablet-only">
            {filters.map(filter => 
              <Button
                key={filter}
                color={currentFilter === filter ? "primary" : "ghost"}
                className="has-text-white mr-0"
                onClick={() => setCurrentFilter(filter)}
              >
                {filter}
              </Button>
            )}
          </Button.Group>

        </Level>

      </Card.Content>
    </Card>
  );
};

const Applicant = ({ image, name, job, platform, submitted, required, reward }) => {
  return (
    <Link
      to={`/app/poh/${123}`}
      className="card is-block"
      style={{
        background: `linear-gradient(to bottom, rgba(0,0,0,0) 0, rgba(0,0,0,1) 70%),
        url(${image}) no-repeat top center`
      }}
    >
      <Card.Header justifyContent="start">
        <Progress
          value={5}
          min={10}
        />
      </Card.Header>

      <Card.Content style={{ paddingTop: "50%" }}>
        <Heading subtitle marginless>
          {name}
        </Heading>
        <p className="is-size-7 mt-2">
          {job}
        </p>
      </Card.Content>
      
      <Card.Footer className="is-block">
        <Card.Header.Title>
          {platform}
          <span>Submitted {submitted}</span>
        </Card.Header.Title>

        <Button.Group className="is-flex-wrap-nowrap mt-5">
          <Button fullwidth className="is-outlined" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <Icon align="left" size="small" className="has-text-white">
              <span className="material-icons">local_atm</span>
            </Icon>
            <span>{"Rq Stake: " + required}</span>
          </Button>
          <Button fullwidth className="is-outlined" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <Icon align="left" size="small" className="has-text-white">
              <span className="material-icons">stars</span>
            </Icon>
            <span>{"Reward: "+ reward}</span>
          </Button>
        </Button.Group>
      </Card.Footer>
    </Link>
  )
};

export default function Verifications() {
  const applicants = [
    {
      image:"https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg",
      name: "Joe Smith",
      job: "Frelance Designer",
      platform: "Tumblr",
      submitted: "38 min ago",
      required: 4444,
      reward: 4444,
    },
    {
      image:"https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg",
      name: "Joe Smith",
      job: "Frelance Designer",
      platform: "Tumblr",
      submitted: "38 min ago",
      required: 4444,
      reward: 4444,
    },
    {
      image:"https://t4.ftcdn.net/jpg/03/64/21/11/360_F_364211147_1qgLVxv1Tcq0Ohz3FawUfrtONzz8nq3e.jpg",
      name: "Joe Smith",
      job: "Frelance Designer",
      platform: "Tumblr",
      submitted: "38 min ago",
      required: 4444,
      reward: 4444,
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
      <Notification color="danger" textAlign="center">
        Proof of Humanity DEMO
      </Notification>

      <Userstats />

      <Columns>
        <Columns.Column size={12}>
          <FilterBar />
        </Columns.Column>
        {applicants.map((applicant) => (
          <Columns.Column
            key={applicant.image}
            mobile={{ size: 12 }}
            tablet={{ size: 6 }}
            fullhd={{ size: 4 }}
            style={{ maxWidth: 480 }}
          >
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