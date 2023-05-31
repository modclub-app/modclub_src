"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Styles from "./styles.module.scss";

export default function SectionThree() {
  const card1Ref = useRef(null);
  const card2Ref = useRef(null);
  const [secondCardMarginTop, setSecondCardMarginTop] = useState(0);
  const [responsive, setResponsive] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 720 && card1Ref.current && card2Ref.current) {
        setResponsive(true);
        const margin = window.getComputedStyle(card1Ref.current).margin;
        const marginTop = parseInt(margin.split(" ")[0]);
        setSecondCardMarginTop(marginTop);
      } else {
        setResponsive(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [card1Ref.current]);

  return (
    <section className={`${Styles.sectionThree} py-20 md:py-72 w-full`}>
      <div className={`${Styles.main} mx-auto`}>
        <div className="header-center text-left grid grid-cols-12">
          <div className="col-start-2 col-span-10 md:mr-56">
            <h2 className="leading-none">
              See how Modclub has helped businesses like yours
            </h2>
            <button className="mt-14 tertiary-btn w-full md:w-auto">
              Don&#39;t just take our word for it
            </button>
          </div>
        </div>
        <hr className="my-16 w-10/12 mx-auto" />
        <div className="cards-area grid grid-cols-12 gap-x-1 text-center text-white">
          <div className="card-v2 card-1 col-span-10 md:col-span-7 col-start-2 md:col-start-2">
            <div
              className="mx-20 my-auto py-20 text-left grid grid-cols-12"
              ref={card1Ref}
            >
              <div className="col-span-10 md:col-span-4 mb-5 md:mb-0">
                <Image
                  src="/assets/karman-ventures.png"
                  width={125}
                  height={125}
                  alt="Karman Ventures"
                />
                <Link target="_blank" href="https://nuance.xyz/">
                  <p className="font-semibold pt-5">Nuance</p>
                </Link>
              </div>
              <div className="col-span-10 md:col-span-8">
                <div className={Styles.testimonial}>
                  <p>
                    Modclub content moderation is transparent- the way it should
                    be. Easy to setup, and now it just runs in the background.
                    One word seamless!
                  </p>
                  <p className="mt-8">
                    First, we collect the relevant information about the content
                    to be verified. Second, we use automated and manual
                    techniques to verify the content, including visual and text
                    analysis.
                  </p>
                </div>
                <div className="gap-x-5 flex mt-10 md:mt-24">
                  {/*<Image
                  src="/assets/william-worker.png"
                  width={50}
                  height={50}
                  alt="William Worker"
                />*/}
                  <div className="my-auto">
                    <p>Nick O’Neill</p>
                    <p>CEO</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="card-v2 card-2 mt-1 md:mt-0 col-start-2 col-span-10 md:col-span-3"
            style={{ alignItems: "flex-start" }}
          >
            <div
              className="mx-20 text-left my-auto py-20"
              style={{ marginTop: responsive ? secondCardMarginTop : "" }}
              ref={card2Ref}
            >
              <p>
                Join our satisfied customer community and streamline your
                content moderation needs with Modclub. Our comprehensive
                platform offers cost-effective, efficient, and customizable
                solutions for maintaining content quality and community safety.
                With powerful analytics and expert moderation services, you can
                make data-driven decisions and focus on your product and
                community. Partner with Modclub today to revolutionize your
                content moderation experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
