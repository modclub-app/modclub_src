import Image from "next/image";
import React from "react";
import Styles from "./styles.module.scss";

export default function Nav() {
  return (
    <nav className="flex w-full justify-between px-10 md:px-20 py-10 text-white">
      <div className={`${Styles.navBrand} gap-x-3 flex`}>
        <Image
          src="/assets/logo-icon.svg"
          height={30}
          width={30}
          alt="Logo Icon"
        />
        <Image
          className="my-auto hidden md:block"
          src="/assets/logo-text.svg"
          height={120}
          width={120}
          alt="Logo Icon"
        />
      </div>
      <div className={Styles.navItems}>
        <ul className="flex gap-x-4">
          <li className="gap-x-3">
            <button className="primary-btn">Sign Up</button>
          </li>
          <li>
            <button className="secondary-btn">Log In</button>
          </li>
          <li className="my-auto">
            <Image
              src="/assets/icon-nav.svg"
              height={40}
              width={40}
              alt="Logo Icon"
            />
          </li>
        </ul>
      </div>
    </nav>
  );
}
