import { useEffect, useState } from "react"
import {
  setupWeb3,
  switchOrAddChain,
  doConnectWithMetamask,
  isMetamaskConnected,
  getConnectedAddress,
  onWalletChanged,
} from "/helpers/setupWeb3"
import FaIcon from "/components/FaIcon"

export default function Header(options) {
  const [activeChainId, setActiveChainId] = useState(false)
  const [activeWeb3, setActiveWeb3] = useState(false)
  const [address, setAddress] = useState(false)
  const [isWalletConecting, setIsWalletConnecting] = useState(false)
  
  useEffect(() => {
    isMetamaskConnected().then((_isConnected) => {
      console.log('>>> header', _isConnected)
      connectWithMetamask()
    })
    onWalletChanged(async (newAccount) => {
      setAddress(newAccount)
    })
  }, [])
  
  const connectWithMetamask = async () => {
    doConnectWithMetamask({
      onBeforeConnect: () => { setIsWalletConnecting(true) },
      onSetActiveChain: setActiveChainId,
      onConnected: (cId, web3) => {
        getConnectedAddress().then((acc) => {
          setAddress(acc)
          setActiveWeb3(web3)
          setIsWalletConnecting(false)
        })
      },
      onError: (err) => {
        console.log(">>>> connectWithMetamask", err)
        processError(err)
        setIsWalletConnecting(false)
      },
      //needChainId: chainId,
    })
  }
  const doDisconnect = () => {

  }
  return (
    <>
      <style jsx>
        {`
          .mainHeader {
            display: block;
          }
          .connectWalletHolder {
            position: relative;
          }
          .connectWalletHolder:hover .dropMenu {
            display: block;
          }
          .dropMenu {
            display: none;
            background: #000000;
            position: absolute;
            right: 0px;
            min-width: 150px;
            top: 100%;
          }
          .dropMenu UL {
            display: block;
            list-style: none;
            padding: 0px;
            margin: 0px;
            color: #FFFFFF;
            text-align: left;
          }
          .dropMenu UL LI {
            padding: 5px;
          }
          .dropMenu UL LI:hover {
            background: #444444;
            cursor: pointer;
          }
        `}
      </style>
      <header className="mainHeader">
        <strong>HEADER</strong>
        <div className="connectWalletHolder">
          {isMetamaskConnected && address ? (
            <>
              <div>
                <FaIcon icon="wallet" />
                {address.substr(0,6)}{`...`}{address.substr(-6,6)}
              </div>
              <div className="dropMenu">
                <ul>
                  <li><a onClick={doDisconnect}>Disconnect</a></li>
                </ul>
              </div>
            </>
          ) : (
            <button onClick={connectWithMetamask}>
              <FaIcon icon="wallet" />
              {`Connect Wallet`}
            </button>
          )}
        </div>
      </header>
    </>
  )
}