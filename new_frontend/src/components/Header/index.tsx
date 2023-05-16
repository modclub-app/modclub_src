import React from "react";
import Link from "next/link";
import Image from "next/image";
import Styles from "./styles.module.scss";
import Nav from "../Nav";

const Header = () => {
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const href = e.currentTarget.href;
    const targetId = href.replace(/.*\#/, "");
    const elem = document.getElementById(targetId);
    elem?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div id="header-section" className="w-full bg-header rounded-3xl">
      <Nav />
      <div className={`text-center ${Styles.headerArea}`}>
        <div className={Styles.headerText}>
          <h1>
            Content moderation is hard, let M
            <span className="-ml-2 mr-2 italic">o</span>dc
            <span className="italic -ml-2 mr-2">l</span>ub make it easy for you
          </h1>
          <h3 className={Styles.headerSubtext}>
            AI powered user verification and content moderation
          </h3>
          <div className="mt-10 flex justify-center gap-x-4">
            <Link
              href="https://wne38odgjn9.typeform.com/to/ryzRV65E"
              target="_blank"
            >
              <button className="primary-btn">Get Started</button>
            </Link>
            <Link
              className="flex my-auto text-2xl"
              href="#section-1"
              onClick={handleScroll}
            >
              More about us
              <Image
                className="ms-2 my-auto"
                src="/assets/arrow-down-icon.svg"
                width={20}
                height={20}
                alt="Arrow Down Icon"
              />
            </Link>
          </div>
        </div>
        <div className="mt-10 md:mt-28 pb-10 md:p-0 md:mx-40 px-10 md:px-0">
          <Image
            className="mx-auto"
            src="/assets/dashboard_main.png"
            width={1200}
            height={1200}
            alt="Arrow Down Icon"
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
