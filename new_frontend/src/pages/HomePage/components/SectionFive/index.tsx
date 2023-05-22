import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Disclosure, Transition } from "@headlessui/react";
import Styles from "./styles.module.scss";

export default function SectionFive() {
  return (
    <section
      className={`py-40 md:py-72 px-14 md:px-40 ${Styles.sectionFive} rounded-3xl w-full`}
    >
      <div className="md:px-3 text-main">
        <div className="header-center text-left grid grid-cols-12">
          <div className="col-span-10">
            <h2>Know More</h2>
          </div>
        </div>
        <div className="header-center">
          <div className="w-full">
            <div className={`${Styles.faq} mx-auto w-full rounded-2xl p-2`}>
              <Disclosure>
                {({ open }) => (
                  <>
                    <hr className="mt-16 mb-10" />
                    <Disclosure.Button
                      className={`${Styles.disclosureBtn} flex w-full justify-between rounded-lg py-2 text-left focus:outline-none`}
                    >
                      <span>
                        <div className="text-3xl text-main flex justify-between">
                          <p className="underline underline-offset-8">
                            Tokenomics
                          </p>
                        </div>
                      </span>
                      <p className="underline underline-offset-8">
                        {open ? "Hide" : "Read"}
                      </p>
                    </Disclosure.Button>
                    <Transition
                      enter="transition duration-100 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Disclosure.Panel className="pt-4 pb-2 text-sm text-gray-500">
                        <div className="flex mt-10">
                          <div className="w-12/12 md:w-1/3">
                            <p>
                              Modclub&#39;s tokenomics model was developed in
                              collaboration with{" "}
                              <Link
                                target="_blank"
                                href="https://e6p3u-6yaaa-aaaah-abkfq-cai.ic0.app/"
                                className={`${Styles.link} text-secondary`}
                              >
                                Quantum Economics
                              </Link>
                              , a research department of{" "}
                              <Link
                                href="https://www.bochslerfinance.com/"
                                target="_blank"
                                className={`${Styles.link} text-secondary`}
                              >
                                Bochsler Consulting
                              </Link>
                              .
                            </p>
                          </div>
                        </div>
                      </Disclosure.Panel>
                    </Transition>
                  </>
                )}
              </Disclosure>
            </div>
          </div>
        </div>
        <div className="header-center">
          <div className="w-full">
            <div className={`${Styles.faq} mx-auto w-full rounded-2xl p-2`}>
              <Disclosure>
                {({ open }) => (
                  <>
                    <hr className="my-10" />
                    <Disclosure.Button
                      className={`${Styles.disclosureBtn} flex w-full justify-between rounded-lg py-2 text-left focus:outline-none`}
                    >
                      <span>
                        <div className="text-3xl text-main flex justify-between">
                          <p className="underline underline-offset-8">
                            Whitepaper
                          </p>
                        </div>
                      </span>
                      <p className="underline underline-offset-8">
                        {open ? "Hide" : "Read"}
                      </p>
                    </Disclosure.Button>
                    <Transition
                      enter="transition duration-100 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                        <p>
                          Learn more about Modclub! Read our{" "}
                          <Link
                            target="_blank"
                            href="https://docsend.com/view/x6ay6xw6f5f3npj8"
                            className={`${Styles.link} text-secondary`}
                          >
                            Whitepaper
                          </Link>
                          .
                        </p>
                      </Disclosure.Panel>
                    </Transition>
                  </>
                )}
              </Disclosure>
              <Disclosure>
                {({ open }) => (
                  <>
                    <hr className="my-10" />
                    <Disclosure.Button
                      className={`${Styles.disclosureBtn} flex w-full justify-between rounded-lg py-2 text-left focus:outline-none`}
                    >
                      <span>
                        <div className="text-3xl text-main flex justify-between">
                          <p className="underline underline-offset-8">
                            Become a Moderator
                          </p>
                        </div>
                      </span>
                      <p className="underline underline-offset-8">
                        {open ? "Hide" : "Read"}
                      </p>
                    </Disclosure.Button>
                    <Transition
                      enter="transition duration-100 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                        <p>
                          Join MODCLUB&#39;s community moderators and help make
                          the internet a better place. Sign up now and moderate
                          to earn!
                        </p>
                      </Disclosure.Panel>
                    </Transition>
                  </>
                )}
              </Disclosure>
              <Disclosure>
                {({ open }) => (
                  <>
                    <hr className="my-10" />
                    <Disclosure.Button
                      className={`${Styles.disclosureBtn} flex w-full justify-between rounded-lg py-2 text-left focus:outline-none`}
                    >
                      <span>
                        <div className="text-3xl text-main flex justify-between">
                          <p className="underline underline-offset-8">FAQs</p>
                        </div>
                      </span>
                      <p className="underline underline-offset-8">
                        {open ? "Hide" : "Read"}
                      </p>
                    </Disclosure.Button>
                    <Transition
                      enter="transition duration-100 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                        <p>How to Integrate with Modclub?</p>
                        <ul>
                          <li>
                            We have a simple to use developer SDK. Reach out to
                            us to get access.
                          </li>
                          <li>
                            You can receive MOD tokens through our airdrop or
                            via exchanges.
                          </li>
                        </ul>
                        <p>What does Modclub token do?</p>
                        <ul>
                          <li>
                            $MOD token is the core utility and governance token
                            of MODCLUB&#39;s platform. The overarching goal of
                            the $MOD is to properly incentivize and reward all
                            MODCLUB ecosystem token holders, and thus ensure the
                            security and utility of the MODCLUB platform. Token
                            Use-Cases:
                          </li>
                          <ol>
                            <li>
                              Means of payment: $MOD will primarily be used as
                              means of payment. DApp developers will pay MODCLUB
                              directly with $MOD for verification services, and
                              MODCLUB will pay moderators with $MOD for service.
                            </li>
                            <li>
                              Qualifying for moderation: Senior moderators will
                              need to stake a certain amount of $MOD in the
                              Governance system to claim verification tasks.
                            </li>
                            <li>
                              Staking & governance: Any $MOD holder that stakes
                              $MOD in the Governance canister will be able to
                              participate in the platform&#39;s decision-making
                              and receive staking rewards. Staking has the
                              potential to increase the token value as it
                              reduces the circulating supply.
                            </li>
                          </ol>
                        </ul>
                      </Disclosure.Panel>
                    </Transition>
                    <hr className="my-10" />
                  </>
                )}
              </Disclosure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
