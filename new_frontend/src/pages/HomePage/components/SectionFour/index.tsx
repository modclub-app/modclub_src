import React from "react";
import Link from "next/link";
import Styles from "./styles.module.scss";

export default function SectionFour() {
  return (
    <section
      className={`py-40 md:py-72 px-14 md:px-40 ${Styles.sectionFour} rounded-3xl`}
    >
      <div className="container text-center p-24 my-40 md:my-96">
        <h2 className="text-main mx-5 md:mx-0 lg:mx-20">
          Offload your content moderation and focus on what matters most - your
          product and community.
        </h2>
        <Link
          href="https://wne38odgjn9.typeform.com/to/ryzRV65E"
          target="_blank"
        >
          <button className="primary-btn">Book a Demo</button>
        </Link>
      </div>
    </section>
  );
}
