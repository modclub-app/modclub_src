import * as React from "react";
import { useEffect, useState } from "react";
import { Principal } from "@dfinity/principal";
import "./Airdrop.scss";
import Footer from "../../footer/Footer";
import { SignIn } from "../../auth/SignIn";
import { useConnect } from "@connect2icmodclub/react";
import { useActors } from "../../../hooks/actors";

export default function MigratedUsersAirdrop() {
  const { principal, isConnected } = useConnect();
  const { modclub } = useActors();
  const [newItem, setNewItem] = useState(null);
  const [airdropItems, setAirdropItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [csvToUpload, setCsvToUpload] = useState(false);
  const [payloadToUpload, setPayloadToUpload] = useState([]);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [uploadButtonLoading, setUploadButtonLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [airdropBalance, setAirdropBalance] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => {
    setShowModal(!showModal);
  };

  useEffect(() => {
    isConnected &&
      modclub &&
      modclub
        .showAdmins()
        .then((admins) => {
          setIsAdmin(true);
        })
        .catch((e) => {
          setIsAdmin(false);
        });
  }, [isConnected, modclub]);

  const addAirdropEntry = async () => {
    if (isConnected && modclub) {
      setButtonLoading(true);
      try {
        const addItemRes = await modclub.appendMigrationAirdropItem(
          Principal.from(newItem)
        );
        console.log("appendMigrationAirdropItem :: ", addItemRes);
        addItemRes.ok && fetchAirdropStats();
      } catch (error) {
        console.error("Error appendMigrationAirdropItem:", error);
      } finally {
        setButtonLoading(false);
        setNewItem(null);
      }
    }
  };

  const fetchAirdropStats = async () => {
    try {
      setLoading(true);
      const airdropStats = await modclub.getMigrationAirdropWhitelist();
      console.log("getMigrationAirdropWhitelist :: ", airdropStats);
      if (airdropStats.ok) {
        setAirdropItems(airdropStats.ok);
      }
    } catch (error) {
      console.error("Error fetching airdropStats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAirdropBalance = async () => {
    try {
      setBalanceLoading(true);
      const airdropBalance = await modclub.getAirdropBalance();
      if (airdropBalance) {
        setAirdropBalance(airdropBalance);
      }
    } catch (error) {
      console.error("Error fetching airdropBalance:", error);
    } finally {
      setBalanceLoading(false);
    }
  };

  const airdropToUser = async (userPrincipal) => {
    try {
      setLoading(true);
      const airdropRes = await modclub.airdropMigratedUser(userPrincipal);
      if (airdropRes.ok) {
        fetchAirdropStats();
        fetchAirdropBalance();
      }
    } catch (error) {
      console.error("Error airdropMigratedUser:", error);
    } finally {
      setLoading(false);
    }
  };

  const airdropToAll = async () => {
    if (confirm("Are you sure?")) {
      try {
        setLoading(true);
        const airdropRes = await modclub.airdropMigratedUsers();
        if (airdropRes.ok) {
          fetchAirdropStats();
          fetchAirdropBalance();
        }
      } catch (error) {
        console.error("Error airdropMigratedUsers:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const uploadAirdropData = async () => {
    if (confirm("Are you sure?")) {
      try {
        setUploadButtonLoading(true);
        const uploadRes = await modclub.setMigrationAirdropWhitelist(
          payloadToUpload
        );
        if (uploadRes.ok) {
          fetchAirdropStats();
        }
      } catch (error) {
        console.error("Error setMigrationAirdropWhitelist:", error);
      } finally {
        setUploadButtonLoading(false);
      }
    }
  };

  const parseAirdropData = (files) => {
    if (files[0]) {
      setCsvToUpload(files[0].name);
      let reader = new FileReader();
      let airdropPrList = [];
      reader.onload = function (e) {
        let rows = e.target.result.split(/\r?\n/);
        rows.slice(1).forEach((r) => {
          let columns = r.split(/,/);
          airdropPrList.push(Principal.from(columns[0]));
        });
        setPayloadToUpload(airdropPrList);
      };
      reader.readAsText(files[0]);
    }
  };

  useEffect(() => {
    if (isConnected && modclub) {
      fetchAirdropStats();
      fetchAirdropBalance();
    }
  }, [isConnected, modclub]);

  if (!isAdmin) {
    return (
      <div className="airdrop-container">
        <div className="instructions">
          <h2>You are not permitted manage airdrop!</h2>
          <p>
            Please ensure your principal is an admin in the platform security
            system.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="info-icon-container">
        <span className="info-icon" onClick={toggleModal}>
          &#8505;
        </span>
      </div>
      {isConnected ? (
        <div className="airdrop-container">
          {loading ? (
            <div className="loader is-loading"></div>
          ) : (
            <>
              <div className="info-container">
                <div class="box">
                  <div class="columns">
                    <div class="column">
                      <div class="file has-name">
                        <div class="file is-boxed">
                          <label class="file-label">
                            <input
                              class="file-input"
                              type="file"
                              name="resume"
                              onChange={(e) => parseAirdropData(e.target.files)}
                            />
                            <span class="file-cta">
                              <span class="file-icon">
                                <i class="fas fa-upload"></i>
                              </span>
                              <span class="file-label">
                                {csvToUpload || "Choose a file…"}
                              </span>
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div class="column">
                      <span class="isCyan">{payloadToUpload.length} Items</span>
                    </div>
                    <div class="column">
                      <button onClick={uploadAirdropData}>
                        {uploadButtonLoading ? (
                          <div className="loader is-loading"></div>
                        ) : (
                          "UploadAirdropPayload"
                        )}
                      </button>
                      <br />
                      <button onClick={airdropToAll}>AirdropToAll</button>
                    </div>
                  </div>
                </div>
                <div class="box">
                  <div class="columns">
                    <div class="column">
                      <p>MOD Available:</p>
                      <span class="isCyan">
                        {balanceLoading ? (
                          <div className="loader is-loading"></div>
                        ) : (
                          airdropBalance + " MOD"
                        )}
                      </span>
                    </div>
                    <div class="column">
                      <p>Distributed:</p>
                      <span class="isCyan">10000 MOD</span>
                    </div>
                    <div class="column">
                      <p>NOT Distributed:</p>
                      <span class="isCyan">1000000 MOD</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="info-container">
                <div class="field is-horizontal">
                  <div class="field-label">
                    <label class="label">Add Single PrincipalID:</label>
                  </div>
                  <div class="field-body">
                    <div class="field">
                      <p class="control">
                        <input
                          class="input is-small is-rounded"
                          type="text"
                          placeholder="PrincipalID for Tokens Airdrop"
                          onBlur={(event) => {
                            console.log("NEW_ITEM_EVENT::", event.target.value);
                            setNewItem(event.target.value);
                          }}
                        />
                        <button onClick={addAirdropEntry}>
                          {buttonLoading ? (
                            <div className="loader is-loading"></div>
                          ) : (
                            "Add New"
                          )}
                        </button>
                      </p>
                    </div>
                  </div>
                </div>
                <table class="table">
                  <thead>
                    <tr>
                      <th>
                        <abbr title="Position">#</abbr>
                      </th>
                      <th>OLD Principal ID</th>
                      <th>
                        <abbr title="Airdrop Status">Airdrop Status</abbr>
                      </th>
                      <th>
                        <abbr title="Airdrop Tokens Amount">Tokens</abbr>
                      </th>
                      <th>
                        <abbr title="Previously Earned UserPoints">
                          UserPoints
                        </abbr>
                      </th>
                      <th>
                        <abbr title="User Migration Status">
                          Migration Status
                        </abbr>
                      </th>
                      <th>
                        <abbr title="Available Actions">Action</abbr>
                      </th>
                    </tr>
                  </thead>
                  <tfoot>
                    <tr>
                      <th>
                        <abbr title=""></abbr>
                      </th>
                      <th></th>
                      <th>
                        <abbr title=""></abbr>
                      </th>
                      <th>
                        <abbr title="Airdrop Tokens Total Amount">10000</abbr>
                      </th>
                      <th>
                        <abbr title=""></abbr>
                      </th>
                      <th>
                        <abbr title=""></abbr>
                      </th>
                      <th>
                        <abbr title="Available Actions"></abbr>
                      </th>
                    </tr>
                  </tfoot>
                  <tbody>
                    {airdropItems.map((item, idx) => (
                      <tr>
                        <th>{++idx}</th>
                        <td>{item[0].toString()}</td>
                        <td>{new Boolean(item[1]).toString()}</td>
                        <td>{parseInt(item[2])}</td>
                        <td>{parseInt(item[3])}</td>
                        <td>{item[4]}</td>
                        <td>
                          <button
                            onClick={() => {
                              airdropToUser(item[0]);
                            }}
                          >
                            send
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="airdrop-container">
          <div className="instructions">
            <h2>Sign in to manage airdrop</h2>
            <p>
              Please ensure your principal is an admin in the platform security
              system.
            </p>
          </div>
          <div className="login">
            <SignIn />
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
