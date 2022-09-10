import React, { useState } from "react";
import { useWallet, useConnect, useCanister } from "@connect2ic/react";
import ClipLoader from "react-spinners/ClipLoader";
import { StoicIdentity } from "ic-stoic-identity";
import extjs from "../utils/stoicTransfer/extjs";

const Transfer = () => {
  const [ICpch] = useCanister("ICpch")
  const [wallet] = useWallet()
  // const [transfer] = useTransfer({
  //   to: "53e271eb078f00f27600992c3237cbd783d9ad95a56dd700b42a2601056d0006",
  //   amount: Number(0.0001),
  // })
  const [walletInUse,setWalletInUse] = useState('');
  const [principalInUse,setPrincipalInUse] = useState('');
  const [currentTransactionStage,setCurrentTransactionStage] = useState(0);
  const transactionStages = {
    0:'Transfer',
    1:'Transfer Initiated',
    2:'Transfer completed',
    3:'Transaction in Verification',
    4:'Transaction verified'
  };

  const onPurchase = async () => {
    switch (walletInUse) {
      case 'stoic':
        setCurrentTransactionStage(1);
        const accountToTransferTo = await ICpch.getCanisterDefaultAccountIdentifier();
        transferUsingStoic(principalInUse, '53e271eb078f00f27600992c3237cbd783d9ad95a56dd700b42a2601056d0006', '0.0001', '0.0001');
        console.log(accountToTransferTo,principalInUse);
        //transferUsingStoic();
        break;
      case 'plug':
        setCurrentTransactionStage(1);
        const principalToTransferTo = await ICpch.getCanisterDefaultAccountIdentifier();
        try {
          const heightPlug = await transferUsingPlug(principalToTransferTo);
          verifyTransaction(heightPlug);
        } catch (error) {
          backToInitialStage(0);
        }
        break;
        default:
          break;
      }
    //const { height } = await transfer()
  };

  const verifyTransaction = async (height) =>{
    if (height) {
      setCurrentTransactionStage(2);
      setCurrentTransactionStage(3);
      const verifyTransfer = await ICpch.verifyTransferToCanister(height);
      if (verifyTransfer && verifyTransfer.is_verified) {
        setCurrentTransactionStage(4);
        backToInitialStage();
      }
      console.log("HEIGHT:",height)
    }else{
      backToInitialStage();
    }
  }

  const backToInitialStage = (tmout=2500)=>{
    setTimeout(() => {
      console.log("backto stage called")
      setCurrentTransactionStage(0);
    }, tmout);
  };

  const { isConnected, principal, activeProvider } = useConnect({
    onConnect: (e) => {
      console.log("Connected",e)
      setWalletInUse(e.activeProvider.meta.id);
      setPrincipalInUse(e.principal);
    },
    onDisconnect: () => {
      // Signed out
      setWalletInUse('');
      setPrincipalInUse('');
    }
  });

  //TRANSFER USING STOIC
  const transferUsingStoic = async (principal,accoutOfToUser,amount,fee) =>{
    //Submit to blockchain here
    let _amount = BigInt(Math.round(amount*(10**8)));
    let _from_sa = 0;
    let _fee = BigInt(Math.round(fee*(10**8)));
    let _memo = '';
    let _notify = true;
    //Load signing ID
    const id = await StoicIdentity.connect();
    if (!id) return console.error("Something wrong with your wallet, try logging in again");
    //hot api, will sign as identity - BE CAREFUL
    extjs.connect("https://boundary.ic0.app/", id).token().transfer(principal, _from_sa, accoutOfToUser, _amount, _fee, _memo, _notify).then(r => {
      if (r) {
        console.log("Transaction complete", "Your transfer was sent successfully", r);
        verifyTransaction(r);
      } else {        
        return console.error("Something went wrong with this transfer");
      }
    }).catch(e => {
      return console.error("There was an error: " + e);
    }).finally(() => {
      console.log('DONE');
    });
  };

  //TRANSFER USING PLUG

  const transferUsingPlug = async (pid) => {
    const params = {
        to: pid,
        amount: 1_000_00
    };
    return await window['ic'].plug.requestTransfer(params);
  }
  return (
    <div className="example">
      {isConnected ? (
        <>
          <p>Transfer</p>
          <button className="connect-button" onClick={onPurchase} disabled={currentTransactionStage > 0}>
            {currentTransactionStage > 0 ?(<><ClipLoader color={'white'} size={15}/>&nbsp;&nbsp;</>):('')}
            {transactionStages[currentTransactionStage]}
          </button>
          {/* {currentTransactionStage > 0?
            (Object.keys(transactionStages).map(key=>{
              <div>
                {currentTransactionStage == key ?(<><ClipLoader color={'white'} size={15}/>&nbsp;&nbsp;</>):('Done')}{transactionStages[key]}
              </div>
            })):
            ('')
          } */}
        </>
      ) : (
        <p className="example-disabled">Connect with a wallet to access this example</p>
      )}
    </div>
  )
}

export { Transfer }
