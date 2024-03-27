import * as React from "react";
import { useEffect, useState } from "react";
import "./Airdrop.scss";
import Footer from "../../footer/Footer";
import { SignIn } from "../../auth/SignIn";
import { useConnect } from "@connect2icmodclub/react";
import { useActors } from "../../../hooks/actors";
import bronze from "../../../../assets/Bronze.gif";
import silver from "../../../../assets/Silver.gif";
import gold from "../../../../assets/Gold.gif";
import logo from "../../../../assets/icon.png";
import lockIcon from "../../../../assets/lock.svg";
import calendarIcon from "../../../../assets/clock.svg";
import coins from "../../../../assets/coins.svg";

export default function Airdrop() {
  const { principal, isConnected: isLoggedIn } = useConnect();
  const { airdrop } = useActors();
  const [NFTs, setNFTs] = useState([]);
  const [accountId, setAccountId] = useState("");
  const [NFTCount, setNFTCount] = useState("0");
  const [totalNFTs, settotalNFTs] = useState("0");
  const [tokensClaimable, setTokensClaimable] = useState("0");
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [reloadUI, setReloadUI] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const getStatus = (nft) => {
    return Object.keys(nft.lastClaim.claimStatus).toString();
  };
  const toggleModal = () => {
    setShowModal(!showModal);
  };

  let tier = {
    gold: 366667,
    silver: 91667,
    bronze: 18333,
    none: 0,
  };

  const getTierImage = (tier) => {
    switch (tier) {
      case "gold":
        return gold;
      case "silver":
        return silver;
      case "bronze":
        return bronze;
      default:
        return bronze;
    }
  };

  const handleClaim = async () => {
    if (airdrop && airdrop.airdrop) {
      setLoading(true);
      try {
        const result = await airdrop.airdrop();

        if ("ok" in result) {
          alert(`${result.ok}`);
          setLoading(false);
        } else if ("err" in result) {
          alert(`Error: ${result.err}`);
        }
      } catch (error) {
        console.error("Error claiming airdrop:", error);
        console.log(airdrop.airdrop);

        alert("Failed to claim airdrop. Please try again.");
      }
    } else {
      alert("Airdrop service is not available. Please try again later.");
    }
  };

  useEffect(() => {
    setLoading(true);
    if (airdrop && airdrop.airdrop) {
      const fetchSubAccountZero = async () => {
        try {
          const subAccountZero = await airdrop.getSubAccountZero();
          setAccountId(subAccountZero);
        } catch (error) {
          console.error("Error fetching subAccountZero:", error);
        } finally {
        }
      };
      fetchSubAccountZero();

      return () => {};
    } else {
    }
  }, [airdrop]);

  useEffect(() => {
    if (airdrop && principal) {
      const fetchNFTCount = async (principal) => {
        try {
          let result = await airdrop.getNFTCount(principal);
          if ("ok" in result) {
            setNFTCount(result.ok.toString());
          }
        } catch (error) {
          console.error("Error fetching NFT count:", error);
        }
      };
      fetchNFTCount(principal);
    }
  }, [airdrop, principal, handleClaim]);

  useEffect(() => {
    if (airdrop && principal) {
      const fetchtotalNFTs = async (principal) => {
        try {
          let result = await airdrop.getAllNFTs();
          if ("ok" in result) {
            settotalNFTs(result.ok.length.toString());
            console.log(result.ok);
          }
        } catch (error) {
          console.error("Error fetching NFTs claimable:", error);
          setButtonLoading(false);
        }
      };
      fetchtotalNFTs(principal);
    }
  }, [airdrop, principal, reloadUI]);

  useEffect(() => {
    if (airdrop && principal) {
      const fetchNFTs = async () => {
        try {
          let result = await airdrop.getAllNFTs();
          if ("ok" in result) {
            setNFTs(result.ok);
            setLoading(false);
            setButtonLoading(false);
          }
        } catch (error) {
          console.error("Error fetching NFTs:", error);
          setButtonLoading(false);
        }
      };
      fetchNFTs();
    }
  }, [airdrop, principal, reloadUI]);

  const handleClaimForNFT = async (nftIndex) => {
    setButtonLoading(true);
    try {
      let result = await airdrop.airdrop(nftIndex);
      if ("ok" in result) {
        alert(`${result.ok}`);
        setReloadUI(!reloadUI);
      } else if ("err" in result) {
        alert(`${result.err}`);
        setButtonLoading(false);
      }
    } catch (error) {
      alert("Failed to claim airdrop. Please try again.");
      setButtonLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    console.log(NFTs);
  }, [NFTs]);

  const getClaimableAmount = (nft) => {
    if (getStatus(nft) === "timeLocked") return 0;
    return nft.claimCount > 11
      ? 0
      : Math.floor(tier[Object.keys(nft.tier)[0]] / 12);
  };

  const getTotalLockedAmount = (nft) => {
    return Math.floor(
      tier[Object.keys(nft.tier)[0]] -
        Number(nft.claimCount) * (tier[Object.keys(nft.tier)[0]] / 12)
    );
  };

  const getTotalClaimed = (nft) => {
    const totalForTier = tier[Object.keys(nft.tier)[0]];
    const amountClaimed = Number(nft.claimCount) * (totalForTier / 12);
    return Math.floor(amountClaimed);
  };

  return (
    <>
      <div className="info-icon-container">
        <span className="info-icon" onClick={toggleModal}>
          &#8505;
        </span>
      </div>
      {isLoggedIn ? (
        <div className="airdrop-container">
          {loading ? (
            <div className="loader is-loading"></div>
          ) : (
            <div className="info-container">
              {showModal && (
                <>
                  <div className="modal-backdrop" onClick={toggleModal}></div>
                  <div className="info-modal">
                    <span className="close-icon" onClick={toggleModal}>
                      &times;
                    </span>
                    <h3>How to claim</h3>
                    <p className="">
                      You can claim your airdrop once per month until paid in
                      full.{" "}
                    </p>
                    <p>
                      Claims are soley based on holding the NFT, this means you
                      can sell or trade the NFT, and the remaining monthly
                      claims will be available to the new owner.
                    </p>
                    <h3>Account</h3>
                    <p>
                      <strong>Principal ID: </strong> {principal}
                    </p>
                    <p>
                      <strong>Account ID: </strong> {accountId}
                    </p>
                  </div>
                </>
              )}

              {NFTs.length > 0 ? (
                <div className="nft-cards">
                  {NFTs.map((nft, index) => (
                    <div
                      key={index}
                      className="nft-card"
                      style={
                        getStatus(nft) === "timeLocked"
                          ? { filter: "brightness(0.5)" }
                          : {}
                      }
                    >
                      <span className="nft-number">#{nft.tokenIndex}</span>
                      <div>
                        <img
                          src={getTierImage(Object.keys(nft.tier)[0])}
                          alt={Object.keys(nft.tier)[0]}
                          className="nft-image"
                        />
                      </div>
                      <div className="nft-card-info">
                        <p
                          className={
                            getStatus(nft) === "timeLocked"
                              ? "not-claimable"
                              : "claimable"
                          }
                        >
                          {getStatus(nft) === "timeLocked"
                            ? `Claim available in ${BigInt(
                                nft.dissolveDelay / BigInt(86400)
                              )} days`
                            : "Claim Available"}
                        </p>

                        <div className="tokens">
                          <img src={logo} alt="logo" className="card-icon" />
                          <p className="text-small">
                            {" "}
                            <strong>Claimable:</strong>{" "}
                            {getClaimableAmount(nft)} MOD
                          </p>
                        </div>
                        <div className="tokens">
                          <img src={coins} alt="logo" className="card-icon" />
                          <p className="text-small">
                            <strong>Total Claimed:</strong>{" "}
                            {getTotalClaimed(nft)} MOD
                          </p>
                        </div>

                        <div className="tokens">
                          <img
                            src={lockIcon}
                            alt="Lock Icon"
                            className="card-icon"
                          />
                          <p className="text-small">
                            <strong>Total Locked: </strong>
                            {getTotalLockedAmount(nft)} MOD
                          </p>
                        </div>

                        <div className="tokens">
                          <img
                            src={calendarIcon}
                            alt="Calendar Icon"
                            className="card-icon"
                          />
                          {nft.lastClaim.timeStamp > 0 ? (
                            <p className="text-small">
                              <strong>Last Claimed:</strong>{" "}
                              {new Date(
                                Number(nft.lastClaim.timeStamp) / 1000000
                              ).toLocaleDateString()}
                            </p>
                          ) : (
                            <p className="text-small">
                              <strong>Last Claimed:</strong> N/A
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleClaimForNFT(nft.tokenIndex)}
                        disabled={
                          getStatus(nft) === "timeLocked" ||
                          buttonLoading === true
                            ? true
                            : false
                        }
                        className={
                          getStatus(nft) === "timeLocked" || buttonLoading
                            ? "disabled"
                            : ""
                        }
                      >
                        {buttonLoading ? (
                          <div className="loader is-loading"></div>
                        ) : (
                          "Claim Tokens"
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="nft-cards">
                  <p>No NFTs to claim.</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="airdrop-container">
          <div className="instructions">
            <h2>Sign in to claim your airdrop</h2>
            <p>
              Please ensure your funded NFT is stored with your wallet of
              choice.
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
