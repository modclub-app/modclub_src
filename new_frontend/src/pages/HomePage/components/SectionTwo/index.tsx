import React from "react";
import Styles from "./styles.module.scss";

export default function SectionTwo() {
  return (
    <section className={`py-80 ${Styles.sectionTwo}`}>
      <div className="header-center text-left grid grid-cols-12">
        <div className="col-start-2 md:col-start-2 col-span-10 md:col-span-4">
          <h2 className="leading-none">Reimagine online safety</h2>
          <p className="mt-14 text-main text-4xl">
            Eliminate the risks, costs and resource burden of in-house content
            moderation and user verification.
          </p>
        </div>
      </div>
      <div className="cards-area grid mt-20 grid-cols-12 gap-x-1 text-center text-white">
        <div className="card items-center md:items-end card-1 col-span-10 md:col-span-6 col-start-2 md:col-start-2">
          <div className="mx-20 mb-12">
            <h3 className="leading-none">Cost-Effective</h3>
            <p>
              Reduce your content moderation costs with flexible pricing plans
              that leverage the power of decentralization, allowing you to pay
              only for what you use.
            </p>
          </div>
        </div>
        <div className="card items-center md:items-end card-2 mt-1 md:mt-0 col-span-10 col-start-2 md:col-span-4">
          <div className="mx-16 mb-12">
            <h3 className="leading-none">Customizable</h3>
            <p>
              Tailor your settings to suit your unique requirements - including
              your platform rules, training auto-moderation, and setting user
              verification levels.
            </p>
          </div>
        </div>
      </div>
      <div className="cards-area grid mt-1 grid-cols-12 gap-x-1 text-center text-white">
        <div className="card items-center md:items-end card-3 col-span-10 md:col-span-4 col-start-2 md:col-start-2">
          <div className="mx-20 mb-12">
            <h3 className="leading-none">Efficient</h3>
            <p>
              AI filtering moderates large volumes of user-generated content
              with speed and accuracy.
            </p>
          </div>
        </div>
        <div className="card items-center md:items-end card-4 mt-1 md:mt-0 col-span-10 col-start-2 md:col-span-6">
          <div className="mx-20 mb-12">
            <h3 className="leading-none">Analytics</h3>
            <p>
              Powerful analytics allow you to track your moderation performance,
              gain insights into user behavior, and make data-driven decisions
              to improve your platform.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
