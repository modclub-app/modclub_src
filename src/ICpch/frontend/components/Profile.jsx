import React from "react"
import { useBalance, useWallet, useConnect } from "@connect2ic/react"

const Profile = () => {

  // const [wallet] = useWallet()
  const [assets] = useBalance();
  const { isConnected, principal, activeProvider } = useConnect({
    onConnect: (e) => {
      console.log("Connected",e)
    },
    onDisconnect: () => {
      // Signed out
    }
  })
  const onReceive = ()=>{
    console.log("Receive Called");
  }
  return (
    <div className="example">
      {isConnected ? (
        <>
          <p>Wallet address (Principal): <span style={{ fontSize: "0.7em" }}>{isConnected ? principal : "-"}</span></p>
          <p>Receive</p>
          <button className="connect-button" onClick={onReceive}>Receive</button>
          <table>
            <tbody>
            {assets && assets.map(asset => (
              <tr key={asset.canisterId}>
                <td>
                  {asset.name}
                </td>
                <td>
                  {asset.amount}
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </>
      ) : (
        <p className="example-disabled">Connect with a wallet to access this example</p>
      )}
    </div>
  )
}

export { Profile }