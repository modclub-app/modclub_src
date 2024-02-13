import React, { useState } from "react";
import ReactDOM from "react-dom/client";

import { VcIssuer } from "./issuer";
import { WithAuth } from "./components/auth";
import { withDisabled } from "./utils";

import "./main.css";

/** Reads the canister ID from the <script> tag.
 *
 * The canister injects the canister ID as a `data-canister-id` attribute on the script tag, which we then read to figure out where to make the IC calls.
 */
const readCanisterId = (): string => {
  // The backend uses a known element ID so that we can pick up the value from here
  const setupJs = document.querySelector(
    "[data-canister-id]"
  ) as HTMLElement | null;
  if (!setupJs || setupJs.dataset.canisterId === undefined) {
    throw new Error("canisterId is undefined"); // abort further execution of this script
  }

  return setupJs.dataset.canisterId;
};

const App = () => {
  const [dsbld, setDsbld] = useState<boolean>(false);
  const [issuingNewVC, setIssuingNewVC] = useState<boolean>(false);
  const [issuedCreds, setIssuedCreds] = useState({});
  const [canisterLogs, setCanisterLogs] = useState<string[]>([]);

  const issueVcLink = async () => {
    const origin = document.getElementById(
      "certification-platform-origin"
    ).value;
    let new_vc_rec = {};
    new_vc_rec[origin] = { status: "PENDING" };
    setIssuedCreds({ ...issuedCreds, ...new_vc_rec });
    const cert_platform = window.open(`${origin}/certification`);

    console.log("cert_platform::", cert_platform);

    cert_platform.postMessage("certification for user", origin);

    setTimeout(() => {
      cert_platform.opener.postMessage(
        {
          certification: {
            canisterId: "huw6a-6uaaa-aaaaa-qaaua-cai",
            userId:
              "holcd-mavly-njy5s-plnii-7wekf-mp564-aehm5-275aj-mlyrs-gnoss-eqe",
          },
        },
        cert_platform.opener.origin
      );
      cert_platform.close();
    }, 5000);

    const evnt = await new Promise((res, rej) => {
      const handler = (e) => {
        window.removeEventListener("message", handler);
        res(e);
      };
      window.addEventListener("message", handler);
    });

    console.log("MESSAGE_RECEIVED::", evnt);

    if (evnt.data.certification.canisterId && evnt.data.certification.userId) {
      const canisterId = readCanisterId();
      const vcIssuer = canisterId && new VcIssuer(canisterId);
      const regRes: string = await vcIssuer.registerCertificationPlatform(
        origin,
        evnt.data.certification.canisterId
      );
      const certRes: string = await vcIssuer.checkCertificate(
        evnt.data.certification.canisterId,
        evnt.data.certification.userId
      );
      setCanisterLogs([
        ...canisterLogs,
        JSON.stringify(regRes),
        JSON.stringify(certRes),
      ]);
    }
  };

  // const checkVCsStatus = () => {
  //         // const canisterId = readCanisterId();
  //       // const vcIssuer = canisterId && new VcIssuer(canisterId);
  //       // const res: string = await vcIssuer.issueVcLink();
  //       // setCanisterLogs([...canisterLogs, res]);
  // };

  return (
    <WithAuth>
      <main data-page="vc">
        <section>
          <button
            id="add-vc"
            disabled={dsbld}
            onClick={() => setIssuingNewVC(!issuingNewVC)}
          >
            <span style={{ fontSize: 36 }}>+</span>
          </button>
        </section>
        {issuingNewVC && (
          <section
            style={{
              border: "1px solid #cfcfcf",
              borderRadius: 10,
              padding: "10px",
            }}
          >
            <label for="certification-platform-origin">
              Certification Origin:
            </label>
            <input type="text" id="certification-platform-origin" />
            <button data-action="issue-vc" onClick={() => issueVcLink()}>
              Issue VC
            </button>
          </section>
        )}

        <section>
          <h3>Issued credentials List</h3>
          <ul>
            {Object.keys(issuedCreds).map((origin) => (
              <li key={origin}>
                {origin} - [STATUS::{issuedCreds[origin].status}]
              </li>
            ))}
          </ul>
        </section>
        <section>
          <label>
            Canister Output Log:
            {canisterLogs.length === 0 ? (
              <output data-unset data-role="canister-logs"></output>
            ) : (
              <output data-role="canister-logs">
                {canisterLogs.join("\n")}
              </output>
            )}
          </label>
        </section>
      </main>
    </WithAuth>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
