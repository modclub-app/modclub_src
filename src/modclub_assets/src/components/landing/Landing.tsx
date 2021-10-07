import "./Landing.scss";
import Card from "../common/Card";
import HowToCard from "./HowToCard";
export default function Landing() {
  return (
    <div className="column">
      <h1 className="slogan">Simple and secure, user generated content moderation</h1>
      <p className="miniSlogan">Modclub is a decentralized content moderation platform, it simplifies the moderation process and makes it easy for moderators and dApps to work together</p>
      <div className="MainButtons">
        <button className="BlueButton LandingButtons">Sign Up</button>
        <button className="DarkButton LandingButtons">Lean More</button>
        </div>
      <div className="LineStyle horizontal-line "></div>
      <h1>How it works</h1>
      <div className="Cards">
        <HowToCard
          title="UGC Data Ingestion"
          desc="DApps send content to Modclub that needs to be reviewed." />
        <HowToCard
          title="Reviewal Phase"
          desc="Moderators review the content and vote to approve or reject it." />
        <HowToCard
          title="Reward Distribution"
          desc="Moderators who voted with majority receive rewards" />
        <HowToCard
          title="Notification"
          desc="Modclub notifies the dApp of the final voting result." />
      </div>
    </div>
  )
}