import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Footer() {
  return (
    <footer className="w-full">
      <div className="container px-14 md:px-40 mx-auto">
        <div className="py-40 md:py-72 md:flex justify-between">
          <div className="md:w-12/12 my-auto">
            <h2 className="text-main">Ready to get started?</h2>
            <Link
              target="_blank"
              href="https://wne38odgjn9.typeform.com/to/ryzRV65E"
            >
              <h2 className="text-secondary underline md:-mt-6">
                Get in touch
              </h2>
            </Link>
            <div className="mt-14 md:mt-0 md:w-3/12 my-auto">
              <div className="mt-28">
                <p>Subscribe to newsletters</p>
                <div className="flex mt-10">
                  <input
                    type="text"
                    className="border-solid border border-primary rounded-full w-96 pl-10 text-2xl"
                    placeholder="Write your e-mail"
                  ></input>
                  <button className="primary-btn">Send</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-10 mt-5 text-xl text-center rounded-tl-3xl rounded-tr-3xl md:flex justify-center md:justify-between bg-header text-white">
        <Link href="#">Modclub 2023</Link>
        <div className="flex gap-x-6 justify-center my-5 md:my-0">
          <Link target="_blank" href="https://twitter.com/ModclubApp">
            Twitter
          </Link>
          <Link target="_blank" href="https://discord.com/invite/8zUrHd46Tf">
            Discord
          </Link>
          <Link target="_blank" href="https://medium.com/@modclub">
            Medium
          </Link>
          <Link target="_blank" href="https://nuance.xyz/">
            Nuance
          </Link>
        </div>
        <Link
          target="_blank"
          href="https://ljyte-qiaaa-aaaah-qaiva-cai.raw.ic0.app/#/privacy"
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
