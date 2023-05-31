"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Tab } from "@headlessui/react";
import Styles from "./styles.module.scss";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function SectionOne() {
  const [categories] = useState(["Content Moderation", "User Verification"]);
  return (
    <section
      id="section-1"
      className={`${Styles.sectionOne} w-full py-20 md:py-80`}
    >
      <div className="header-center text-center mx-auto">
        <div>
          <h2>Modular solutions</h2>
          <p className="text-4xl pt-6 px-10 md:px-0 text-main font-second">
            A fully integrated suite of moderation and user verification
            products
          </p>
        </div>
        <div className="bg-white mx-5 md:mx-40 rounded-3xl mt-24">
          <div className="justify-center text-main py-16 gap-x-12">
            <Tab.Group>
              <Tab.List className="flex space-x-1 p-1 mx-auto md:w-4/12 justify-center">
                {categories.map((category, i) => (
                  <Tab
                    key={i}
                    className={({ selected }) =>
                      classNames(
                        "w-full",
                        "ring-white ring-opacity-60 ring-offset-2 focus:outline-none focus:ring-2",
                        selected
                          ? "font-semibold transition ease-in-out duration-200"
                          : "text-gray-600 text-opacity-50 transition ease-in-out duration-200"
                      )
                    }
                  >
                    <p>{category}</p>
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels className="mt-2">
                <Tab.Panel>
                  <div className="grid grid-cols-12 mt-16 gap-x-10 justify-center">
                    <div className="col-span-10 md:col-span-4 col-start-2 md:col-start-2 my-8 md:my-auto text-left">
                      <h3 className="leading-none">
                        Hassle-Free Content Moderation
                      </h3>
                      <p className="md:mr-32 mt-14">
                        Looking for an efficient way to manage user-generated
                        content? Modclub&#39;s content moderation tool offers
                        customizable moderation rules and real-time
                        notifications, at a fraction of the cost of in-house
                        moderation.
                      </p>
                      <p className="mt-8 md:mr-32">
                        Integrate with Modclub and discover cost-effective,
                        efficient, customizable, and analytical content
                        moderation services that protect your brand reputation
                        and foster user trust.
                      </p>
                      <Link
                        href="https://wne38odgjn9.typeform.com/to/ryzRV65E"
                        target="_blank"
                      >
                        <button className="primary-btn mt-14 w-full md:w-60">
                          Book a Demo
                        </button>
                      </Link>
                    </div>
                    <div className="col-span-10 md:col-span-6 md:col-start-0 col-start-2 flex justify-center items-center p-4">
                      <Image
                        src="/assets/moderation_preview.png"
                        width={600}
                        height={600}
                        alt="Section Two Hero Image"
                      />
                    </div>
                  </div>
                </Tab.Panel>
                <Tab.Panel>
                  <div className="grid grid-cols-12 mt-16 gap-x-10 justify-center">
                    <div className="col-span-10 md:col-span-4 col-start-2 md:col-start-2 my-8 md:my-auto text-left">
                      <h3 className="leading-none">
                        Proof of Humanity Bot Protection
                      </h3>
                      <p className="md:mr-32 mt-14">
                        Are you struggling with spam, bot accounts, sybil
                        attacks and tracking real user engagement?
                      </p>
                      <p className="mt-8 md:mr-32">
                        Modclub offers a Proof of Humanity user-verification
                        service that is flexible, transferable, and seamless.
                        With customizable challenges that can be scaled to your
                        project&#39;s needs, you can choose the level of
                        verification required for your users. This service helps
                        ensure that real humans are using your platform,
                        improving security and user experience.
                      </p>
                      <Link
                        href="https://wne38odgjn9.typeform.com/to/ryzRV65E"
                        target="_blank"
                      >
                        <button className="primary-btn mt-14">
                          Book a Demo
                        </button>
                      </Link>
                    </div>
                    <div className="col-span-10 md:col-span-6 md:col-start-0 col-start-2 flex justify-center items-center p-4">
                      <Image
                        src="/assets/poh_preview.png"
                        width={600}
                        height={600}
                        alt="Section Two Hero Image"
                      />
                    </div>
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </div>
    </section>
  );
}
