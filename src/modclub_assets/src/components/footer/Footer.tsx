import modclubImg from "../../../assets/logo.png";
import { HashLink } from "react-router-hash-link";

export default function Footer() {
  return (
    <footer className="section footer has-background-black pb-6">
      <div className="container content">

        <div className="columns">
          <div className="column is-one-fifth">
            <img src={modclubImg} style={{ width: 60, height: 60 }} />
          </div>
          <div className="column is-one-fifth">
            <h4 className="subtitle has-text-white">Menu</h4>
            <HashLink to="/#developers" className="is-block has-text-white">
              Developers
            </HashLink>
            <HashLink to="/#tokenomics" className="is-block has-text-white">
              Tokenomics
            </HashLink>
            <HashLink to="/#roadmap" className="is-block has-text-white">
              Roadmap
            </HashLink>
          </div>
          <div className="column is-one-fifth">
            <h4 className="subtitle has-text-white">Company</h4>
            <a href="mailto:team@modclub.app" className="is-block has-text-white">
              Contact
            </a>
          </div>
        </div>

        <hr style={{ marginTop: 60, marginBottom: 60 }} />
        
        <div className="level">
          <p className="has-text-silver">&copy; 2021 MODCLUB. All Rights Reserved</p>
          <a href="#main" className="has-text-silver">Go to the top</a>
        </div>
      </div>
    </footer>
  );
}
