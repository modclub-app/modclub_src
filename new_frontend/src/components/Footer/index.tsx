"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import Styles from "./styles.module.scss";

export default function Footer() {
  const [hover, setHover] = useState(false);
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    const href = e.currentTarget.href;
    const targetId = href.replace(/.*#/, "");
    const elem = document.getElementById(targetId);
    elem?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <footer className="w-full">
      <div
        className={`${Styles.container} py-40 md:py-72 px-28 md:px-20 mx-auto`}
      >
        <Link
          target="_blank"
          href="https://wne38odgjn9.typeform.com/to/ryzRV65E"
        >
          <div
            onMouseEnter={() => {
              setHover(true);
            }}
            onMouseLeave={() => {
              setHover(false);
            }}
            className={`${Styles.main} md:flex justify-between rounded-3xl text-main hover:px-14 hover:py-10 hover:text-white cursor-pointer`}
          >
            <div className="w-12/12 sm:w-12/12 lg:w-12/12 my-10 md:my-auto">
              <h4>
                Ready to <br className={Styles.lineBreak} />
                get started?
              </h4>
            </div>
            <div className="w-12/12 lg:w-4/10 my-auto">
              <Image
                src={
                  hover
                    ? "/assets/footer-logo-hover.svg"
                    : "/assets/footer-logo.svg"
                }
                alt="Logo Footer"
                width={600}
                height={700}
              />
            </div>
          </div>
        </Link>
        <hr className="my-10" />
      </div>
      <div className="w-full bg-header">
        <div
          className={`p-10 mt-5 text-xl mx-auto md:text-center md:flex justify-center md:justify-between text-white ${Styles.container}`}
        >
          <Link href="#header-section" onClick={handleScroll}>
            Modclub 2023
          </Link>
          <div className="flex gap-x-6 w-1/3 flex-wrap md:justify-center mt-8 mb-10 md:my-0">
            <Link
              target="_blank"
              className="mt-3 md:mt-0"
              href="https://twitter.com/ModclubApp"
            >
              Twitter
            </Link>
            <Link
              target="_blank"
              className="mt-3 md:mt-0"
              href="https://discord.com/invite/8zUrHd46Tf"
            >
              Discord
            </Link>
            <Link
              target="_blank"
              className="mt-3 md:mt-0"
              href="https://medium.com/@modclub"
            >
              Medium
            </Link>
          </div>
          <Link
            target="_blank"
            href="https://ljyte-qiaaa-aaaah-qaiva-cai.ic0.app/#/privacy"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
