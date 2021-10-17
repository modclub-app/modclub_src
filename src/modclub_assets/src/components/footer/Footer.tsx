import "./Footer.scss";
import modclubImg from "../../../assets/logo.png";
export default function Footer() {
  return (
    <div className="Footer">
      <div className="FooterInner">
        <div className="FooterRow">
          <div className="FooterCol">
            <a href="/">
              <div className="FooterLogo">
                <img src={modclubImg} />
              </div>
            </a>
          </div>
          <div className="FooterCol">
            <p>Menu</p>
            <ul className="FooterList">
              <li>
                <a href="#developers">Developers</a>
              </li>
              <li>
                <a href="#tokenomics">Tokenomics</a>
              </li>
              <li>
                <a href="#team">Team</a>
              </li>
              <li>
                <a href="#roadmap">Roadmap</a>
              </li>
            </ul>
          </div>
          <div className="FooterCol">
            <p>Company</p>
            <ul className="FooterList">
              <li>
                <a href="mailto:team@modclub.app">Contact</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="horizontal-line FooterLine"></div>
        <div className="FooterRow" style={{ justifyContent: "space-between" }}>
          <span className="Copywrite">
            © 2021 MODCLUB. All Rights Reserved{" "}
          </span>
          <a className="Copywrite" href="#main">
            Go to the top
          </a>
        </div>
      </div>
    </div>
  );
}
