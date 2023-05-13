import Image from "next/image";
import Link from "next/link";
import React from "react";
import Styles from "./styles.module.scss";

export default function SectionFive() {
  return (
    <section
      className={`py-40 md:py-72 px-14 md:px-40 ${Styles.sectionFive} rounded-3xl`}
    >
      <div className="md:px-3 text-main">
        <div className="header-center text-left grid grid-cols-12">
          <div className="col-span-10">
            <h2>Know More</h2>
          </div>
        </div>
        <hr className="mt-16 mb-10" />
        <div className="header-center text-left grid grid-cols-12">
          <div className="col-span-12">
            <div className="text-3xl text-main flex justify-between">
              <Link href="#">Tokenomics</Link>
              <Link href="#">Hide</Link>
            </div>
          </div>
        </div>
        <div className="flex mt-20">
          <Image
            className="w-full"
            src="/assets/section-five-hero-img.svg"
            width={600}
            height={500}
            alt="Section Five Hero Image"
          />
        </div>
        <div className="flex mt-10">
          <div className="w-12/12 md:w-1/3">
            <p>
              Modclub&apos;s tokenomics model was developed in collaboration
              with Quantum Economics, a research department of Bochsler
              Consulting.
            </p>
            <p className="mt-10">
              To learn more about Modclub&apos;s tokenomics model you can access
              our Tokenomics Paper.
            </p>
          </div>
        </div>
        <div className="header-center text-left grid grid-cols-12">
          <div className="col-span-12">
            <hr className="mt-20 mb-10" />
            <div className="text-3xl text-main flex justify-between">
              <Link href="#">Whitepaper</Link>
              <Link href="#">Read</Link>
            </div>
            <hr className="mt-14 mb-10" />
            <div className="text-3xl text-main flex justify-between">
              <Link href="#">Become a Moderator</Link>
              <Link href="#">Read</Link>
            </div>
            <hr className="mt-14 mb-10" />
            <div className="text-3xl text-main flex justify-between">
              <Link href="#">FAQ</Link>
              <Link href="#">Read</Link>
            </div>
            <hr className="mt-14 mb-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
