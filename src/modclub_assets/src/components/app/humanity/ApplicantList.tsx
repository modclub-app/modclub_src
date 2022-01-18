import { Link } from "react-router-dom";
import {
  Heading,
  Columns,
  Card,
  Button,
  Icon
} from "react-bulma-components";
import Progress from "../../common/progress/Progress";
import Userstats from "../profile/Userstats";
import { formatDate } from "../../../utils/util";
import { PohTaskPlus } from "../../../utils/types";


// export interface PohTaskPlus {
//   'status' : ContentStatus,
//   'title' : [] | [string],
//   'voteCount' : bigint,
//   'minVotes' : bigint,
//   'minStake' : bigint,
//   'pohTaskData' : Array<PohTaskData>,
//   'hasVoted' : [] | [boolean],
//   'packageId' : string,
// }

const ApplicantSnippet = ({ applicant }) => {
  console.log("ApplicantSnippet", applicant);
  // const { fullName, aboutUser, dataCanisterId, contentId, createdAt } = applicant.pohTaskData[1];
  const { fullName, aboutUser, dataCanisterId, contentId, createdAt } = applicant;

  // const imageUrl = `http://localhost:8000/storage?canisterId=${dataCanisterId}&contentId=${contentId[0]}`;
  const imageUrl = '';
  
  return (
    <Link
      to={`/app/poh/${applicant.packageId}`}
      className="card is-block"
      style={{
        background: `linear-gradient(to bottom, rgba(0,0,0,0) 0, rgba(0,0,0,1) 70%),
        url(${imageUrl}) no-repeat top center`
      }}
    >
      <Card.Header justifyContent="start">
        <Progress
          value={applicant.voteCount}
          min={applicant.minVotes}
        />
      </Card.Header>

      <Card.Content style={{ paddingTop: "50%" }}>
        <Heading subtitle marginless>
          {fullName}
        </Heading>
        <p className="is-size-7 mt-2">
          {aboutUser}
        </p>
      </Card.Content>
      
      <Card.Footer className="is-block">
        <Card.Header.Title>
          <span style={{ marginLeft: 0, paddingLeft: 0, borderLeft: 0 }}>
            Submitted {formatDate(createdAt)}
          </span>
        </Card.Header.Title>

        <Button.Group className="is-flex-wrap-nowrap mt-5">
          <Button fullwidth className="is-outlined" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <Icon align="left" size="small" className="has-text-white">
              <span className="material-icons">local_atm</span>
            </Icon>
            <span>{"Rq Stake: " + applicant.minStake}</span>
          </Button>
          <Button fullwidth className="is-outlined" style={{ paddingLeft: 0, paddingRight: 0 }}>
            <Icon align="left" size="small" className="has-text-white">
              <span className="material-icons">stars</span>
            </Icon>
            <span>{"Reward: " + applicant.minStake}</span>
          </Button>
        </Button.Group>
      </Card.Footer>
    </Link>
  )
};

// export default function ApplicantList({ applicants } : { applicants: PohTaskPlus[] }) {
export default function ApplicantList({ applicants }) {
  return (
    <>
      <Userstats />

      <Columns>
        {applicants.map((applicant, index) => (
          <Columns.Column
            key={index}
            mobile={{ size: 12 }}
            tablet={{ size: 6 }}
            fullhd={{ size: 4 }}
            style={{ maxWidth: 480 }}
          >
            <ApplicantSnippet applicant={applicant} />
          </Columns.Column>
        ))}
        </Columns>
    </>
  )
}