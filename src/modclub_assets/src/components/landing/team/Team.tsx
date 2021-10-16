import "./Team.scss";

import Card from "../../common/Card";
import raheel from '../../../../assets/raheel.png';
import pema from '../../../../assets/pema.png';
import max from '../../../../assets/max.png';
import chris from '../../../../assets/chris.png';

export default function Team() {
  return (
    <div className="column">
      <div className="TextTitle marginTop marginBottom">Our Team</div>
      <div className="Cards">
        <Card >
          <div className="TeamCard">
            <img className="TeamMemberAvatar" src={raheel} />
            <div className="TeamMemberName">Raheel Govindji</div>
            <div className="TeamMemberTitle">CEO and Founder</div>
          </div>
        </Card>
        <Card>
        <div className="TeamCard">
            <img className="TeamMemberAvatar" src={chris} />
            <div className="TeamMemberName">Chris Porteus</div>
            <div className="TeamMemberTitle">Marketing Advisor</div>
          </div>
        </Card>
        <Card>
        <div className="TeamCard">
            <img className="TeamMemberAvatar" src={pema} />
            <div className="TeamMemberName">Pema Banigan</div>
            <div className="TeamMemberTitle">Partnership Lead</div>
          </div>
        </Card>
        <Card>
        <div className="TeamCard">
            <img className="TeamMemberAvatar" src={max} />
            <div className="TeamMemberName">Max Zidel</div>
            <div className="TeamMemberTitle">Business Advisor</div>
          </div>
        </Card>
      </div>

    </div>
  )
}