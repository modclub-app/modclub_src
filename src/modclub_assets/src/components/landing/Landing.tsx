import "./Landing.scss";
import Card from "../common/Card";
import HowToCard from "./HowToCard";
import BenefitCard from "./BenefitCard";
import TokenomicsBox from "./TokenomicsBox";
import { Doughnut } from "react-chartjs-2";
import HowTo1 from "../../../assets/network.png";
import HowTo2 from "../../../assets/internet.png";
import HowTo3 from "../../../assets/award.png";
import HowTo4 from "../../../assets/network2.png";
import RewardsImg from "../../../assets/Section3.png";
import CommunityImg from "../../../assets/community.png";
import WinnerImg from "../../../assets/winner.png";
import HumanityImg from "../../../assets/humanity.png";
import IntegrationImg from "../../../assets/integrate.png";
import Charts, { ChartType } from "chart.js";
import Roadmap from "./roadmap/Roadmap";
import Team from './team/Team';
import Faq from "./faq/Faq";
import Contact from "./contact/Contact";
import Community from "./community/Community";
import Footer from "../footer/Footer";
const options = {
  legend: {
    display: false,
    position: "right",
  },
  elements: {
    arc: {
      borderWidth: 0,
    },
  },
};

const data = {
  labels: [
    "Team",
    "Private Sale",
    "Public Sale",
    "Advisors",
    "Marketing & Relations",
    "Reserve",
    "Airdrop",
  ],
  datasets: [
    {
      label: "# of Votes",
      data: [20, 15, 10, 5, 10, 39.75, 0.25],
      backgroundColor: [
        "#FB6A00", // Team
        "#5EBEE1", // Private
        "#185698", // Public
        "#00109B", // Advisors
        "#CB339C", // Marketing
        "#3D52FA", // Reserve
        "#007CE0", // Airdrop
      ],
      borderColor: "#000",
      borderWidth: 1,
    },
  ],
};

export default function Landing() {
  return (
    <div className="column">
      <div className="Landing">
        <h1 className="slogan">
          Simple and secure, user generated content moderation
        </h1>
        <p className="miniSlogan">
          Modclub is a decentralized content moderation platform, it simplifies
          the moderation process and makes it easy for moderators and dApps to
          work together
        </p>
        <div className="MainButtons">
          <button className="BlueButton LandingButtons">Sign Up</button>
          <button className="DarkButton LandingButtons">Lean More</button>
        </div>
        <div className="LineStyle horizontal-line "></div>
        <div className="TextTitle">How it works</div>
        <div className="Cards">
          <HowToCard
            step={1}
            title="UGC Data Ingestion"
            img={HowTo1}
            desc="DApps send content to Modclub that needs to be reviewed."
          />
          <HowToCard
            step={2}
            title="Reviewal Phase"
            img={HowTo2}
            desc="Moderators review the content and vote to approve or reject it."
          />
          <HowToCard
            step={3}
            title="Reward Distribution"
            img={HowTo3}
            desc="Moderators who voted with majority receive rewards"
          />
          <HowToCard
            step={4}
            title="Notification"
            img={HowTo4}
            desc="Modclub notifies the dApp of the final voting result."
          />
        </div>
        <div className="LineStyle horizontal-line "></div>
        <div className="row">
          <img src={RewardsImg} style={{ marginRight: 10 }} />
          <div className="ModeratorSection" style={{ marginLeft: 10 }}>
            <div>
              <div className="HighlightedTextTitle">Become a Moderator</div>
              <div className="TextTitle">Earn Rewards</div>
            </div>
            <div className="ModerateText">
              Moderators earn reward tokens for actively moderating and
              participating on the platform.
            </div>

            <button className="BlueButton LandingButtons">Sign Up</button>
          </div>
        </div>
        <div className="LineStyle horizontal-line "></div>
        <a id="developers"/>
        <div className="TextTitle marginTop marginBottom">
          Benefits for Developers
        </div>
        <div className="Cards">
          <BenefitCard
            title="A large community 
          of moderators"
            img={CommunityImg}
            desc="Modclub is the central place for Apps to offload their moderation. We will always have a large community of moderators."
          />
          <BenefitCard
            title="Reward users with 
          your own token"
            img={WinnerImg}
            desc="If you have your own platform token. You can choose to reward moderators."
          />
          <BenefitCard
            title="Proof 
          of Humanity"
            img={HumanityImg}
            desc="Use MODCLUB to prove your users are real."
          />
          <BenefitCard
            title="Easy 
          to Integrate"
            img={IntegrationImg}
            desc="With our SDK you can get setup in minutes."
          />
        </div>
        <button className="BlueButton LandingButtons marginTop marginBottom">
          Developer Sign Up
        </button>
        <div className="LineStyle horizontal-line "></div>
        <a id="tokenomics"/>
        <div className="row" style={{ width: "100%" }}>
          <div className="column columnLeft" style={{ paddingLeft: 20 }}>
            <div className="TextTitle marginTop marginBottom">Tokenomics</div>
            <div className="TokenomicsText marginBottom">
              MODCLUB (MOD) adopts a deflationary system where the more MOD are
              used the more tokens are burned. It will have a Max-Supply of 100
              Millions and it can be used to earn platform fees, pay for
              platform services and get access to Airdrops and other awesome
              features.
            </div>
            <Doughnut
              data={data}
              options={{
                plugins: {
                  legend: {
                    position: "bottom",
                    align: "start",
                  },
                },
              }}
            />
          </div>
          <div className="row left">
            <div className="column">
              <TokenomicsBox title="Initial Max Supply" value="1,000,000,000" />
              <TokenomicsBox title="Token Type" value="Utility" />
              <TokenomicsBox title="Initial Price" value="$0.01" />
            </div>
            <div className="column">
              <TokenomicsBox title="Token Symbol" value="MOD" />
              <TokenomicsBox title="Token Type" value="Utility" />
            </div>
          </div>
        </div>
        <div className="LineStyle horizontal-line "></div>
        <a id="roadmap"/>
        <div className="column" >
          <div className="TextTitle marginTop marginBottom">
              Roadmap
          </div>
          <div>
            <strong>2021</strong>
          </div>
            <Roadmap />
        </div>
        <div className="LineStyle horizontal-line "></div>
        <a id="team"/>
        <div className="row">
          <Team />
        </div>
        <div className="LineStyle horizontal-line "></div>
        <div className="row">
          <div className="column columnLeft">
            <div className="TextTitle marginTop marginBottom">
                FAQ
            </div>
            <Faq />
          </div>
          <div  className="CommunitySection">
            <div className="TextTitle marginTop marginBottom">
                Community
            </div>
            <Community/>
          </div>          
        </div>
        <div className="LineStyle horizontal-line "></div>
      </div>
      <Footer />
    </div>
  );
}
