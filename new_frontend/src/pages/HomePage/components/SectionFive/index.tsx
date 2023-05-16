import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Disclosure, Transition } from "@headlessui/react";
import Styles from "./styles.module.scss";

export default function SectionFive() {
  const items = [
    {
      title: "Whitepaper",
      body: `Learn more about Modclub! Read our <a href='https://docsend.com/view/x6ay6xw6f5f3npj8' className='${Styles.link} text-secondary' target='_blank'>Whitepaper</a>.`,
    },
    {
      title: "Become a Moderator",
      body: "Learn more about Modclub! Read our Whitepaper.",
    },
  ];
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
        <div className="header-center">
          <div className="w-full">
            <div
              className={`${Styles.defaultOpen} ${Styles.faq} mx-auto w-full rounded-2xl p-2`}
            >
              <Disclosure defaultOpen={true}>
                {({ open }) => (
                  <>
                    <hr className="mt-16 mb-10" />
                    <Disclosure.Button
                      className={`${Styles.disclosureBtn} flex w-full justify-between rounded-lg py-2 text-left focus:outline-none`}
                    >
                      <span>
                        <div className="text-3xl text-main flex justify-between">
                          <p>Tokenomics</p>
                        </div>
                      </span>
                      {open ? <p>Hide</p> : <p>Read</p>}
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
                              Modclub&apos;s tokenomics model was developed in
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
                          <Link href="#" onClick={(e) => e.preventDefault()}>
                            <p>Whitepaper</p>
                          </Link>
                        </div>
                      </span>
                      <Link href="#" onClick={(e) => e.preventDefault()}>
                        {open ? <p>Hide</p> : <p>Read</p>}
                      </Link>
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
                          <Link href="#" onClick={(e) => e.preventDefault()}>
                            <p>Become a Moderator</p>
                          </Link>
                        </div>
                      </span>
                      <Link href="#" onClick={(e) => e.preventDefault()}>
                        {open ? <p>Hide</p> : <p>Read</p>}
                      </Link>
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
                          Join Modclub&apos;s community moderators and help make
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
                          <Link href="#" onClick={(e) => e.preventDefault()}>
                            <p>FAQs</p>
                          </Link>
                        </div>
                      </span>
                      <Link href="#" onClick={(e) => e.preventDefault()}>
                        {open ? <p>Hide</p> : <p>Read</p>}
                      </Link>
                    </Disclosure.Button>
                    <Transition
                      enter="transition duration-100 ease-out"
                      enterFrom="transform scale-95 opacity-0"
                      enterTo="transform scale-100 opacity-100"
                      leave="transition duration-75 ease-out"
                      leaveFrom="transform scale-100 opacity-100"
                      leaveTo="transform scale-95 opacity-0"
                    >
                      <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700">
                          How to Integrate with Modclub?
                        </h3>
                        <ul className="list-disc list-inside space-y-2">
                          <li className="text-gray-600">
                            We have a simple to use developer SDK.{" "}
                            <a
                              href="mailto:team@modclub.app"
                              className={`${Styles.link} text-secondary`}
                            >
                              Reach out to us to get access.
                            </a>
                          </li>
                          <li className="text-gray-600">
                            You can receive MOD tokens through our airdrop or
                            via exchanges.
                          </li>
                        </ul>
                        <h3 className="text-lg font-semibold text-gray-700">
                          What does Modclub token do?
                        </h3>
                        <p className="text-gray-600">
                          MOD token is the core utility and governance token of
                          Modclub&apos;s platform. The overarching goal of the
                          MOD is to properly incentivize and reward all MODCLUB
                          ecosystem token holders, and thus ensure the security
                          and utility of the Modclub platform. Token Use-Cases:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 pl-5">
                          <li className="text-gray-600">
                            Means of payment: MOD will primarily be used as
                            means of payment. DApp developers will pay Modclub
                            directly with MOD for verification services, and
                            Modclub will pay moderators with MOD for service.
                          </li>
                          <li className="text-gray-600">
                            Qualifying for moderation: Senior moderators will
                            need to stake a certain amount of MOD in the
                            Governance system to claim verification tasks.
                          </li>
                          <li className="text-gray-600">
                            Staking & governance: Any MOD holder that stakes MOD
                            in the Governance canister will be able to
                            participate in the platform&apos;s decision-making
                            and receive staking rewards. Staking has the
                            potential to increase the token value as it reduces
                            the circulating supply.
                          </li>
                        </ol>
                      </Disclosure.Panel>
                    </Transition>
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
