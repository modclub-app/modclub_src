import "./Landing.scss";
import Card from "../../common/Card";
import HowToCard from "./HowToCard";
import BenefitCard from "./BenefitCard";
import TokenomicsBox from "./TokenomicsBox";
import { Doughnut } from "react-chartjs-2";
import HowTo1 from "../../../../assets/network.png";
import HowTo2 from "../../../../assets/internet.png";
import HowTo3 from "../../../../assets/award.png";
import HowTo4 from "../../../../assets/network2.png";
import RewardsImg from "../../../../assets/Section3.png";
import CommunityImg from "../../../../assets/community.png";
import WinnerImg from "../../../../assets/winner.png";
import HumanityImg from "../../../../assets/humanity.png";
import IntegrationImg from "../../../../assets/integrate.png";
import Charts, { ChartType } from "chart.js";
import Roadmap from "./roadmap/Roadmap";
import Team from "./team/Team";
import Faq from "./faq/Faq";
import Community from "./community/Community";
import Footer from "../../footer/Footer";
import DfinityLogo from "../../../../assets/dfinity.svg";
import { fileToImgSrc, getImage, UploadImage } from "../../../utils/api";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { SignIn } from "../../Auth/SignIn";
// import MenuItems from "../../header/MenuItems";

const options = {
  // legend: {
  //   display: false,
  //   position: "right",
  // },
  // elements: {
  //   arc: {
  //     borderWidth: 0,
  //   },
  // },
};

const data = {
  labels: [
    "Team",
    "Private Sale",
    "Public Sale",
    "Advisors",
    "Marketing",
    "Reserve",
    "Airdrop",
  ],
  datasets: [
    {
      label: "Allocation",      
      data: [20, 15, 10, 5, 10, 39, 1],
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
  plugins: {
    labels: {
      render: "percentage",
      fontColor: '#fff',
      precision: 2
    }
  }
};

export default function Landing() {
  const [pic, setPic] = useState(null);
  const history = useHistory();

  const getPic = async () => {
    const data = await getImage('id_1');
    setPic(fileToImgSrc(data));
  };

  const handleFileChange = (files) => {
    if (files.length > 0) {
      const f = files[0];
      const reader = new FileReader();
      reader.onload = function (evt) {
        const metadata = `name: ${f.name}, type: ${f.type}, size: ${f.size}, contents:`;
        console.log("Data Type: " + (typeof evt.target.result));
        console.log({ metadata })
        console.log(evt.target.result);
        const data = (typeof evt.target.result == "string") ? evt.target.result : null;
        UploadImage(data);
      };
      reader.readAsDataURL(f);
    }
  }



  

  return (
    <div className="has-background-black">
    {/* <div className="hero">
      <h1 className="title is-size-1 has-text-centered">
        Decentralized content moderation<br /> on the Internet Computer{" "}
        <img className="DfinityLogo" src={DfinityLogo} />
      </h1>

      <p className="has-text-silver is-size-3 has-text-centered" style={{ maxWidth: 747 }}>
        MODCLUB is a decentralized content moderation platform, it simplifies the moderation process by connecting our community to dApps that need UGC moderation.
      </p>
    </div> */}





    <section className="hero is-black is-medium">
      <div className="hero-body container">
        <div className="container has-text-centered is-flex is-flex-wrap-wrap	is-justify-content-center">
          <h1 className="title is-size-1" style={{ maxWidth: 800 }}>
            Decentralized content moderation<br /> on the Internet Computer{" "}
            <img className="DfinityLogo" src={DfinityLogo} />
          </h1>
          <p className="has-text-silver is-size-4 has-text-centered" style={{ maxWidth: 747 }}>
            MODCLUB is a decentralized content moderation platform, it simplifies the moderation process by connecting our community to dApps that need UGC moderation.
          </p>
          <div>
            <a className="button is-large">Coming Soon</a>
          </div>
        </div>
      </div>
    </section>

    <section className="container" style={{ maxWidth: 960 }}>

      <hr style={{ marginTop: 100, marginBottom: 100 }} />

      <h1 className="title is-size-1 has-text-centered mt-6">
        How it works
      </h1>

      <div className="columns">
        <div className="column">
          <div className="card has-background-dark">
            <div className="card-content has-text-centered pt-6 px-2">
              <h3 className="subtitle mb-4">Step 1</h3>
              <h3 className="subtitle">UGC Data Ingestion</h3>
              <img src={HowTo1} style={{ height: 60, width: 60, margin: 10 }} />
              <p className="is-size-5 has-text-silver">DApps send UGC data to MODCLUB for review.</p>
            </div>
          </div>
        </div>

        <div className="column">
          <div className="card has-background-dark">
            <div className="card-content has-text-centered pt-6 px-2">
              <h3 className="subtitle mb-4">Step 2</h3>
              <h3 className="subtitle">Moderator Review</h3>
              <img src={HowTo2} style={{ height: 60, width: 60, margin: 10 }} />
              <p className="is-size-5 has-text-silver">Moderators review the content then vote to approve or reject it.</p>
            </div>
          </div>
        </div>

        <div className="column">
          <div className="card has-background-dark">
            <div className="card-content has-text-centered pt-6 px-2">
              <h3 className="subtitle mb-4">Step 3</h3>
              <h3 className="subtitle">Reward Distribution</h3>
              <img src={HowTo3} style={{ height: 60, width: 60, margin: 10 }} />
              <p className="is-size-5 has-text-silver">Moderators who voted with majority receive rewards.</p>
            </div>
          </div>
        </div>

        <div className="column">
          <div className="card has-background-dark">
            <div className="card-content has-text-centered pt-6 px-2">
              <h3 className="subtitle mb-4">Step 4</h3>
              <h3 className="subtitle">Notification</h3>
              <img src={HowTo4} style={{ height: 60, width: 60, margin: 10 }} />
              <p className="is-size-5 has-text-silver">MODCLUB notifies the dApp of the final voting result.</p>
            </div>
          </div>
        </div>
      </div>

      <hr style={{ marginTop: 100, marginBottom: 100 }} />

      <div className="columns">
        <div className="column has-text-right">
          <img
            src={RewardsImg}
            style={{ height: 500, marginRight: 10 }}
          />
        </div>
        <div className="column">
          <h3 className="title is-size-1 has-text-secondary mb-3">Become a Moderator</h3>
          <h3 className="title is-size-1">Earn Rewards</h3>
          <p className="has-text-silver is-size-4 mb-5">
            Moderators earn reward tokens for actively moderating and participating on the platform.
          </p>
          <a className="button is-large">Coming Soon</a>
        </div>
      </div>

      <hr style={{ marginTop: 100, marginBottom: 100 }} />

      <h3 className="title is-size-1 has-text-centered">Benefits for Developers</h3>

      <div className="columns">
        <div className="column">
          <div className="card has-background-dark">
            <div className="card-content p-3">
              <img src={CommunityImg} style={{ height: 105, width: 185, borderRadius: 4 }} />
              <h3 className="subtitle my-4">A large community of moderators</h3>
              <p className="has-text-silver mb-6">MODCLUB is the central place for dApps to offload their moderation.</p>
            </div>
          </div>
        </div>

        <div className="column">
          <div className="card has-background-dark">
            <div className="card-content p-3">
              <img src={WinnerImg} style={{ height: 105, width: 185, borderRadius: 4 }} />
              <h3 className="subtitle my-4">Reward users with your own token</h3>
              <p className="has-text-silver mb-6">You can choose to reward moderators with your own platform token.</p>
            </div>
          </div>
        </div>

        <div className="column">
          <div className="card has-background-dark">
            <div className="card-content p-3">
              <img src={HumanityImg} style={{ height: 105, width: 185, borderRadius: 4 }} />
              <h3 className="subtitle my-4">Proof of Humanity</h3>
              <p className="has-text-silver mb-6">Use MODCLUB to prove your users are real.</p>
            </div>
          </div>
        </div>

        <div className="column">
          <div className="card has-background-dark">
            <div className="card-content p-3">
              <img src={IntegrationImg} style={{ height: 105, width: 185, borderRadius: 4 }} />
              <h3 className="subtitle my-4">Easy to Integrate</h3>
              <p className="has-text-silver mb-6">With our SDK you can get setup in minutes.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="has-text-centered pt-3">
        <a className="button is-primary is-large">Contact Us</a>
      </div>

      <hr style={{ marginTop: 100, marginBottom: 100 }} />

      <div className="columns">
        <div className="column">
          <h3 className="title is-size-1">Tokenomics</h3>
          <p className="is-size-5 has-text-white">
            MODCLUB Tokens (MOD) will play a crucial role in the MODCLUB ecosystem. It is a reputation token that is required in order to participate in the platform. It can be used to receive rewards, participate in governance, get access to Airdrops and other awesome features.
          </p>
          <div className="tokenomicsPie">
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
        </div>
        <div className="column">
        </div>
      </div>

    </section>




    <div className="column">
      <div className="Landing">
        <h1 className="title is-size-1">
          Decentralized content moderation on the Internet Computer{" "}
          <img className="DfinityLogo" src={DfinityLogo} />
        </h1>
        <p className="miniSlogan">
          MODCLUB is a decentralized content moderation platform, it simplifies the moderation process by connecting our community to dApps that need UGC moderation.
        </p>
        <div className="MainButtons">
          <button className="DarkButton LandingButtons" onClick={() => history.push('/app')}>Coming Soon</button>
          <SignIn />
        </div>
        <img src={pic} width="100" height="100" />

        <input type="file" onChange={ (e) => handleFileChange(e.target.files) } />
        <div className="LineStyle horizontal-line "></div>

        <div className="TextTitle">How it works</div>
        <div className="Cards">
          <HowToCard
            step={1}
            title="UGC Data Ingestion"
            img={HowTo1}
            desc="DApps send UGC data to MODCLUB for review."
          />
          <HowToCard
            step={2}
            title="Moderator Review"
            img={HowTo2}
            desc="Moderators review the content then vote to approve or reject it."
          />
          <HowToCard
            step={3}
            title="Reward Distribution"
            img={HowTo3}
            desc="Moderators who voted with majority receive rewards."
          />
          <HowToCard
            step={4}
            title="Notification"
            img={HowTo4}
            desc="MODCLUB notifies the dApp of the final voting result."
          />
        </div>
        <div className="LineStyle horizontal-line "></div>
        <div className="row">
          <img
            className="rewardsImg"
            src={RewardsImg}
            style={{ marginRight: 10 }}
          />
          <div className="ModeratorSection" style={{ marginLeft: 10 }}>
            <div className="HighlightedTextTitle">Become a Moderator</div>
            <div className="TextTitle">Earn Rewards</div>

            <div className="ModerateText">
              Moderators earn reward tokens for actively moderating and
              participating on the platform.
            </div>

            <button className="DarkButton LandingButtons">Coming Soon</button>
          </div>
        </div>
        <div className="LineStyle horizontal-line "></div>
        <a id="developers" />
        <div className="column">
          <div className="TextTitle marginTop marginBottom">
            Benefits for Developers
          </div>
          <div className="Cards">
            <BenefitCard
              title="A large community 
          of moderators"
              img={CommunityImg}
              desc="MODCLUB is the central place for dApps to offload their moderation."
            />
            <BenefitCard
              title="Reward users with 
          your own token"
              img={WinnerImg}
              desc="You can choose to reward moderators with your own platform token."
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
          <a href="mailto:team@modclub.app">
            <button className="BlueButton DevButton marginTop marginBottom">
              Contact Us
            </button>
          </a>
        </div>
        <div className="LineStyle horizontal-line "></div>
        <a id="tokenomics" />
        <div className="row" style={{ width: "100%" }}>
          <div
            id="tokenSection"
            className="column columnLeft"
            style={{ paddingLeft: 20 }}
          >
            <div className="TextTitle marginTop marginBottom">Tokenomics</div>
            <div className="Tokenomics Text marginBottom">
              MODCLUB Tokens (MOD) will play a crucial role in the MODCLUB ecosystem. It is a reputation token that is required in order to participate in the platform. It can be used to receive rewards, participate in governance, get access to Airdrops and other awesome
              features.
            </div>
            <div className="tokenomicsPie">
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
          </div>
          <div className="row left">
            <div className="column">
              <TokenomicsBox title="Initial Max Supply" value="1,000,000,000" />
              <TokenomicsBox title="Token Type" value="Utility" />
              <TokenomicsBox title="Initial Price" value="TBD" />
            </div>
            <div className="column">
              <TokenomicsBox title="Token Symbol" value="MOD" />
              <TokenomicsBox title="Token Supply" value="Deflationary" />
            </div>
          </div>
        </div>
        <div className="LineStyle horizontal-line "></div>
        <a id="roadmap" />
        <div className="column">
          <div className="TextTitle marginTop marginBottom">Roadmap</div>
          <div>
            <strong>2021</strong>
          </div>
          <Roadmap />
        </div>
        <div className="LineStyle horizontal-line "></div>
        <a id="team" />
        <div className="row">
          <Team />
        </div>
        <div className="LineStyle horizontal-line "></div>
        <div className="row">
          <div className="FaqSection">
            <div className="TextTitle marginTop marginBottom">FAQ</div>
            <Faq />
          </div>
          <div className="CommunitySection">
            <div className="TextTitle marginTop marginBottom">Community</div>
            <Community />
          </div>
        </div>
        <div className="LineStyle horizontal-line "></div>
      </div>
      <Footer />
    </div>
    </div>
  );
}
function hexToRgb(arg0: any) {
  throw new Error("Function not implemented.");
}

