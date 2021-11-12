import "./Header.scss";
import Logo from './LogoComponent';
import MenuItems from "./MenuItems";
import LoginSignup from "./LoginSignup";
import Hamburger from "./Hamburger";
export default function Header() {
  return (
    <nav className="navbar has-background-black py-5" role="navigation" aria-label="main navigation">
      <div className="container">
        <div className="navbar-brand">
          <Logo />
          {/* <a role="button" className="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a> */}
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


    // <div className="Outer">
    //   <div className="Header">
    //     <Logo />
    //     <MenuItems />
    //     <Hamburger />
    //   </div>
    // </div>
  )
}