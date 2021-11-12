import modclubImg from "../../../assets/logo.png";

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
            <a href="#developers" className="is-block has-text-white">
              Developers
            </a>
            <a href="#tokenomics" className="is-block has-text-white">
              Tokenomics
            </a>
            <a href="#team" className="is-block has-text-white">
              Team
            </a>
            <a href="#roadmap" className="is-block has-text-white">
              Roadmap
            </a>
          </div>
          <div className="column is-one-fifth">
            <h4 className="subtitle has-text-white">Company</h4>
            <a href="#contact" className="is-block has-text-white">
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