import modclubImg from "../../../assets/logo.png";

export default function Sidebar() {
  return (
    <div className="column">
      <aside className="column is-2 is-narrow-mobile is-fullheight section is-hidden-mobile">

        <div className="FooterLogo">
          <img src={modclubImg} />
        </div>

        <p className="menu-label is-hidden-touch">Navigation</p>
        <ul className="menu-list">
          <li>
            <a href="#">
              <span className="icon"></span> Home
            </a>
          </li>
          <li>
            <a href="#" className="is-active">
              <span className="icon"></span> Links
            </a>
          </li>
          <li>
            <a href="#" className="">
              <span className="icon"></span> About
            </a>
          </li>
        </ul>
      </aside>


      
    </div>
  );
}
