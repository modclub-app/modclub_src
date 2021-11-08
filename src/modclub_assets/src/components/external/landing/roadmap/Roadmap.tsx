import roadMapImg from '../../../../assets/roadmap.png';
import "./Roadmap.scss";
import RoadmapCard from './RoadMapCard';
export default function Roadmap() {
  const roadmap = {
    m1 : {
      title: "Q4 2021",
      direction: 'right',
      points: [
        "Web Application MVP",
        "Content Moderation",
        'Proof of Humanity',
        'Launch SDK',
        'Fundraising'
      ]
    },
    m2 : {
      title: "Q1 2022",
      direction: 'left',
      points: [
        "UGC Pre-approval",
        "Programatic scripting",
        "Plug wallet support",
        "Complete raise",
        "Team buildout",
      ]
    },
    m3 : {
      title: "Q2 2022",
      direction: 'right',
      points: [
        "Content labelling support",
        "Public sale & Token launch",
        "Enable moderators to receive partner tokens"
      ]
    },
    m4 : {
      title: "Q3 2022",
      direction: 'left',
      points: [
        "KYC",
        "Governance System",
        'Multi-language support',
        'Moderator educational content',
      ]
    },
    m5 : {
      title: "Q4 2022",
      direction: 'right',
      points: [
        "AI content filtering",
        'AI image detection'
      ]
    }
    
  }
  return (
    <div id="roadmapContent" className="row" style={{height: '100%'}}>
      <div className="column leftCards">
        <RoadmapCard
          title={roadmap.m1.title}
          points={roadmap.m1.points}
          direction={roadmap.m1.direction}
        />
      <RoadmapCard
          title={roadmap.m3.title}
          points={roadmap.m3.points}
          direction={roadmap.m3.direction}
        />
      <RoadmapCard
          title={roadmap.m5.title}
          points={roadmap.m5.points}
          direction={roadmap.m5.direction}
        />
      </div>
      <div className="roadmapLine" />
      <div className="column rightCards">
      <RoadmapCard
          title={roadmap.m2.title}
          points={roadmap.m2.points}
          direction={roadmap.m2.direction}
        />
              <RoadmapCard
          title={roadmap.m4.title}
          points={roadmap.m4.points}
          direction={roadmap.m4.direction}
        />
      </div>
    </div>
  )
}