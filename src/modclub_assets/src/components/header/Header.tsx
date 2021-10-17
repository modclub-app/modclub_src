import "./Header.scss";
import Logo from './LogoComponent';
import MenuItems from "./MenuItems";
import LoginSignup from "./LoginSignup";
import Hamburger from "./Hamburger";
export default function Header() {
  return (

    <div className="Outer">
      <div className="Header">
        <Logo />
        <MenuItems />
        <Hamburger />
      </div>
    </div>
  )
}