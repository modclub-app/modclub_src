import * as React from "react";
import "./Landing.scss";
import HowTo1 from "../../../../assets/network.png";
import HowTo2 from "../../../../assets/internet.png";
import HowTo3 from "../../../../assets/award.png";
import HowTo4 from "../../../../assets/network2.png";
import RewardsImg from "../../../../assets/Section3.png";
import CommunityImg from "../../../../assets/community.png";
import WinnerImg from "../../../../assets/winner.png";
import HumanityImg from "../../../../assets/humanity.png";
import IntegrationImg from "../../../../assets/integrate.png";
import Faq from "./faq/Faq";
import Footer from "../../footer/Footer";
import DfinityLogo from "../../../../assets/dfinity.svg";
import twitterImg from "../../../../assets/twitter.png";
import discordImg from "../../../../assets/discord.jpeg";
import dscvrImg from "../../../../assets/dscvr.jpeg";
import mediumImg from "../../../../assets/medium.png";
import { useHistory } from "react-router-dom";

export default function Landing() {
  const history = useHistory();
  return (
    <div className="landing-page has-background-black">
      <section className="hero is-black is-medium">
        <div className="hero-body container has-text-centered">
          <h1 className="title is-size-1">
            Decentralized content moderation on the Internet Computer
            <img className="DfinityLogo" src={DfinityLogo} />
          </h1>
          <p className="has-text-silver is-size-4 has-text-centered mb-6">
            MODCLUB is a decentralized content moderation platform, it
            simplifies the moderation process by connecting our community to
            dApps that need UGC moderation.
          </p>
          <div>
            <a
              className="button is-large extra is-primary mt-6"
              onClick={() => history.push("/app")}
            >
              Beta 1.0
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 960 }}>
          <h1 className="title is-size-1 has-text-centered">How it works</h1>

          <div className="columns">
            <div className="column">
              <div className="card is-fullheight has-background-dark has-bottom-gradient">
                <div className="card-content has-text-centered pt-6 px-2">
                  <h3 className="subtitle mb-4">Step 1</h3>
                  <h3 className="subtitle">UGC Data Ingestion</h3>
                  <img
                    src={HowTo1}
                    style={{ height: 60, width: 60, margin: 10 }}
                  />
                  <p className="is-size-5 has-text-silver">
                    DApps send UGC data to MODCLUB for review.
                  </p>
                </div>
              </div>
            </div>

            <div className="column">
              <div className="card is-fullheight has-background-dark has-bottom-gradient">
                <div className="card-content has-text-centered pt-6 px-2">
                  <h3 className="subtitle mb-4">Step 2</h3>
                  <h3 className="subtitle">Moderator Review</h3>
                  <img
                    src={HowTo2}
                    style={{ height: 60, width: 60, margin: 10 }}
                  />
                  <p className="is-size-5 has-text-silver">
                    Moderators review the content then vote to approve or reject
                    it.
                  </p>
                </div>
              </div>
            </div>

            <div className="column">
              <div className="card is-fullheight has-background-dark has-bottom-gradient">
                <div className="card-content has-text-centered pt-6 px-2">
                  <h3 className="subtitle mb-4">Step 3</h3>
                  <h3 className="subtitle">Reward Distribution</h3>
                  <img
                    src={HowTo3}
                    style={{ height: 60, width: 60, margin: 10 }}
                  />
                  <p className="is-size-5 has-text-silver">
                    Moderators who voted with majority receive rewards.
                  </p>
                </div>
              </div>
            </div>

            <div className="column">
              <div className="card is-fullheight has-background-dark has-bottom-gradient">
                <div className="card-content has-text-centered pt-6 px-2">
                  <h3 className="subtitle mb-4">Step 4</h3>
                  <h3 className="subtitle">Notification</h3>
                  <img
                    src={HowTo4}
                    style={{ height: 60, width: 60, margin: 10 }}
                  />
                  <p className="is-size-5 has-text-silver">
                    MODCLUB notifies the dApp of the final voting result.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 960 }}>
          <div className="columns">
            <div className="column RewardsImg">
              <img src={RewardsImg} style={{ height: 500, marginRight: 10 }} />
            </div>
            <div className="column">
              <h3 className="title is-size-1 has-text-secondary mb-3">
                Become a Moderator
              </h3>
              <h3 className="title is-size-1">Earn Rewards</h3>
              <p className="has-text-silver is-size-4 mb-5">
                Moderators earn reward tokens for actively moderating and
                participating on the platform.
              </p>
              <a
                className="button is-large extra is-primary"
                onClick={() => history.push("/app")}
              >
                Beta 1.0
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div id="developers" className="container" style={{ maxWidth: 960 }}>
          <h3 className="title is-size-1 has-text-centered mb-6">
            Benefits for Developers
          </h3>

          <div className="columns">
            <div className="column">
              <div className="card is-fullheight has-background-dark has-bottom-gradient">
                <div className="card-content p-3">
                  <img
                    src={CommunityImg}
                    style={{
                      height: 105,
                      width: 185,
                      borderRadius: 4,
                      display: "block",
                      margin: "auto",
                    }}
                  />
                  <h3 className="subtitle my-4">
                    A large community of moderators
                  </h3>
                  <p className="has-text-silver mb-6">
                    MODCLUB is the central place for dApps to offload their
                    moderation.
                  </p>
                </div>
              </div>
            </div>

            <div className="column">
              <div className="card is-fullheight has-background-dark has-bottom-gradient">
                <div className="card-content p-3">
                  <img
                    src={WinnerImg}
                    style={{
                      height: 105,
                      width: 185,
                      borderRadius: 4,
                      display: "block",
                      margin: "auto",
                    }}
                  />
                  <h3 className="subtitle my-4">
                    Reward users with your own token
                  </h3>
                  <p className="has-text-silver mb-6">
                    You can choose to reward moderators with your own platform
                    token.
                  </p>
                </div>
              </div>
            </div>

            <div className="column">
              <div className="card is-fullheight has-background-dark has-bottom-gradient">
                <div className="card-content p-3">
                  <img
                    src={HumanityImg}
                    style={{
                      height: 105,
                      width: 185,
                      borderRadius: 4,
                      display: "block",
                      margin: "auto",
                    }}
                  />
                  <h3 className="subtitle my-4">Proof of Humanity</h3>
                  <p className="has-text-silver mb-6">
                    Use MODCLUB to prove your users are real.
                  </p>
                </div>
              </div>
            </div>

            <div className="column">
              <div className="card is-fullheight has-background-dark has-bottom-gradient">
                <div className="card-content p-3">
                  <img
                    src={IntegrationImg}
                    style={{
                      height: 105,
                      width: 185,
                      borderRadius: 4,
                      display: "block",
                      margin: "auto",
                    }}
                  />
                  <h3 className="subtitle my-4">Easy to Integrate</h3>
                  <p className="has-text-silver mb-6">
                    With our SDK you can get setup in minutes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="has-text-centered pt-3">
            <a
              className="button is-large extra is-primary"
              href="mailto:team@modclub.app"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div id="roadmap" className="container" style={{ maxWidth: 960 }}>
          <h3 className="title is-size-1 has-text-centered">Roadmap</h3>

          <label className="label has-text-white has-text-centered">2021</label>

          <div className="columns is-justify-content-center is-relative is-hidden-mobile">
            <div className="roadmapLine"></div>

            <div className="column is-one-quarter">
              <div className="card has-background-dark my-6 arrow-right">
                <div className="card-content">
                  <h4 className="subtitle">Q4 2021</h4>
                  <ul
                    className="has-text-silver"
                    style={{ listStyleType: "disc", paddingLeft: 16 }}
                  >
                    <li>Web Application MVP</li>
                    <li>Content Moderation</li>
                    <li>Launch SDK</li>
                  </ul>
                </div>
              </div>
              <div className="card has-background-dark mb-6 arrow-right">
                <div className="card-content">
                  <h4 className="subtitle">Q2 2022</h4>
                  <ul
                    className="has-text-silver"
                    style={{ listStyleType: "disc", paddingLeft: 16 }}
                  >
                    <li>Stoic and Plug wallet support</li>
                    <li>Moderator peer review system</li>
                    <li>Automatic reward distribution</li>
                    <li>Pseudo random task distribution</li>
                  </ul>
                </div>
              </div>
              <div className="card has-background-dark mb-6 arrow-right">
                <div className="card-content">
                  <h4 className="subtitle">Q4 2022</h4>
                  <ul
                    className="has-text-silver"
                    style={{ listStyleType: "disc", paddingLeft: 16 }}
                  >
                    <li>Content labeling</li>
                    <li>AI content filtering</li>
                    <li>AI image detection</li>
                    <li>Expand language support</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="column is-one-quarter">
              <div className="card has-background-dark mb-6 arrow-left">
                <div className="card-content" style={{ marginTop: 100 }}>
                  <h4 className="subtitle">Q1 2022</h4>
                  <ul
                    className="has-text-silver"
                    style={{ listStyleType: "disc", paddingLeft: 16 }}
                  >
                    <li>UGC Pre-approval</li>
                    <li>Proof of Humanity</li>
                    <li>Educational content for Moderators</li>
                  </ul>
                </div>
              </div>
              <div className="card has-background-dark mb-6 arrow-left">
                <div className="card-content">
                  <h4 className="subtitle">Q3 2022</h4>
                  <ul
                    className="has-text-silver"
                    style={{ listStyleType: "disc", paddingLeft: 16 }}
                  >
                    <li>KYC</li>
                    <li>Governance System via SNS</li>
                    <li>Multi-language support</li>
                    <li>Enable 3rd party partner token rewards</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="is-hidden-tablet">
            <div className="card has-background-dark mb-6">
              <div className="card-content">
                <h4 className="subtitle">Q4 2021</h4>
                <ul
                  className="has-text-silver"
                  style={{ listStyleType: "disc", paddingLeft: 16 }}
                >
                  <li>Web Application MVP</li>
                  <li>Content Moderation</li>
                  <li>Launch SDK</li>
                </ul>
              </div>
            </div>
            <div className="card has-background-dark mb-6">
              <div className="card-content">
                <h4 className="subtitle">Q1 2022</h4>
                <ul
                  className="has-text-silver"
                  style={{ listStyleType: "disc", paddingLeft: 16 }}
                >
                  <li>UGC Pre-approval</li>
                  <li>Proof of Humanity</li>
                  <li>Educational content for Moderators</li>
                </ul>
              </div>
            </div>
            <div className="card has-background-dark mb-6">
              <div className="card-content">
                <h4 className="subtitle">Q2 2022</h4>
                <ul
                  className="has-text-silver"
                  style={{ listStyleType: "disc", paddingLeft: 16 }}
                >
                  <li>Stoic and Plug wallet support</li>
                  <li>Moderator peer review system</li>
                  <li>Automatic reward distribution</li>
                  <li>Pseudo random task distribution</li>
                </ul>
              </div>
            </div>
            <div className="card has-background-dark mb-6">
              <div className="card-content">
                <h4 className="subtitle">Q3 2022</h4>
                <ul
                  className="has-text-silver"
                  style={{ listStyleType: "disc", paddingLeft: 16 }}
                >
                  <li>KYC</li>
                  <li>Governance System via SNS</li>
                  <li>Multi-language support</li>
                  <li>Enable 3rd party partner token rewards</li>
                </ul>
              </div>
            </div>
            <div className="card has-background-dark mb-6">
              <div className="card-content">
                <h4 className="subtitle">Q4 2022</h4>
                <ul
                  className="has-text-silver"
                  style={{ listStyleType: "disc", paddingLeft: 16 }}
                >
                  <li>Content labeling</li>
                  <li>AI content filtering</li>
                  <li>AI image detection</li>
                  <li>Expand language support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 960 }}>
          <div className="columns">
            <div className="column is-flex is-flex-direction-column">
              <h3 className="title is-size-1">FAQ</h3>

              <div className="card is-fullheight has-background-dark">
                <div className="card-content p-0">
                  <Faq />
                </div>
              </div>
            </div>

            <div className="column">
              <h3 className="title is-size-1">Community</h3>

              <div className="columns is-multiline">
                <div className="column is-half">
                  <div className="card has-background-dark">
                    <div className="card-content has-text-centered">
                      <a href="https://twitter.com/ModclubApp" target="_blank">
                        <img
                          src={twitterImg}
                          style={{ width: 60, height: 60, borderRadius: 4 }}
                        />
                      </a>
                      <h3 className="subtitle mt-5">Twitter</h3>
                    </div>
                  </div>
                </div>
                <div className="column is-half">
                  <div className="card has-background-dark">
                    <div className="card-content has-text-centered">
                      <a href="http://discord.gg/8zUrHd46Tf" target="_blank">
                        <img
                          src={discordImg}
                          style={{ width: 60, height: 60, borderRadius: 4 }}
                        />
                      </a>
                      <h3 className="subtitle mt-5">Discord</h3>
                    </div>
                  </div>
                </div>
                <div className="column is-half">
                  <div className="card has-background-dark">
                    <div className="card-content has-text-centered">
                      <a href="https://dscvr.one" target="_blank">
                        <img
                          src={dscvrImg}
                          style={{ width: 60, height: 60, borderRadius: 4 }}
                        />
                      </a>
                      <h3 className="subtitle mt-5">DSCVR</h3>
                    </div>
                  </div>
                </div>
                <div className="column is-half">
                  <div className="card has-background-dark">
                    <div className="card-content has-text-centered">
                      <a href="https://medium.com/@modclub" target="_blank">
                        <img
                          src={mediumImg}
                          style={{ width: 60, height: 60, borderRadius: 4 }}
                        />
                      </a>
                      <h3 className="subtitle mt-5">Medium</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
