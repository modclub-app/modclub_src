import LogoImg from '../../../assets/logo.png';
import Hamburger from "./Hamburger";

export default function Header() {
  return (
    <nav className="section navbar has-background-black py-5" role="navigation" aria-label="main navigation">
      <div className="container">
        <div className="navbar-brand">
          <a id='main' href="/">
            <div className="is-flex is-align-items-center">
              <img src={LogoImg} style={{ height: 40, width: 40}} />
              <h1 className="title is-size-3 ml-2" style={{ fontFamily: 'sans-serif' }}>MODCLUB</h1>
            </div>
          </a>
          <Hamburger />
        </div>

        <div id="navbarBasicExample" className="navbar-menu">
          <div className="navbar-end">
            <a href="#developers" className="navbar-item">
              Developers
            </a>
            <a href="#tokenomics" className="navbar-item">
              Tokenomics
            </a>
            <a href="#team" className="navbar-item">
              Team
            </a>
            <a href="#roadmap" className="navbar-item">
              Roadmap
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}