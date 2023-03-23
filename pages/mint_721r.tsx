import { ethers } from "ethers"
import BigNumber from "bignumber.js"
import type { NextPage } from "next"
import { useEffect, useState } from "react"
import styles from "../styles/Home.module.css"

import { setupWeb3, switchOrAddChain, doConnectWithMetamask, isMetamaskConnected } from "../helpers/setupWeb3"
import { calcSendArgWithFee } from "../helpers/calcSendArgWithFee"
import navBlock from "../components/navBlock"
import logoBlock from "../components/logoBlock"
import { getLink } from "../helpers"
import { useRouter } from "next/router"
import useStorage from "../storage"
import fetchNftInfo from "../helpers/fetchNftInfo"
import callContractMethod from "../helpers/callContractMethod"
import crypto from "crypto"
import nftToken from "../components/nftToken"
import NftAirdropContractData from "../contracts/source/artifacts/NFT_ERC721r.json"
import MyNFTAbi from '../contracts/MyNFTAbi.json'
import { CHAIN_INFO } from "../helpers/constants"
import { toWei, fromWei } from "../helpers/wei"


const debugLog = (msg) => { console.log(msg) }

const Mint721r = (props) => {
  const {
    storageData,
    isOwner,
    addNotify,
    getText,
    getDesign,
    storageMenu,
  } = props

  const [ chainId, setChainId ] = useState(storageData?.chainId)
  const [ nftDropContractAddress, setNftDropContractAddress ] = useState(storageData?.nftCollection)

  const [activeChainId, setActiveChainId] = useState(false)
  const [activeWeb3, setActiveWeb3] = useState(false)
  const [address, setAddress] = useState(false)

  const [airdropContract, setAirdropContract] = useState(false)

  const [isWalletConecting, setIsWalletConnecting] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [isMinted, setIsMinted] = useState(false)
  const [mintedNFT, setMintedNft] = useState({})
  const [mintedNFTs, setMintedNFTs] = useState([])

  const [ nftInfoFetched, setNftInfoFetched ] = useState(false)
  const [ mintCost, setMintCost ] = useState(0)
  const [ mintMaxCount, setMintMaxCount ] = useState(1)
  const [ mintCount, setMintCount ] = useState(1)
  const [ baseExtension, setBaseExtension ] = useState(false)
  
  const processError = (error, error_namespace) => {
    let metamaskError = false
    try {
      metamaskError = error.message.replace(`Internal JSON-RPC error.`,``)
      metamaskError = JSON.parse(metamaskError)
    } catch (e) {}
    const errMsg = (metamaskError && metamaskError.message) ? metamaskError.message : error.message
    
    switch (errMsg) {
      case `execution reverted: You don't own this token!`:
        console.log(`You dont own this token`)
        break;
      case `MetaMask Tx Signature: User denied transaction signature.`:
        console.log('Transaction denied')
        break;
      case `execution reverted: ERC721: invalid token ID`:
        console.log('Invalid token ID')
        break;
      default:
        console.log('Unkrnown error', error.message)
        break;
    }
  }

  const fetchERC721rInfo = (nftContract) => {
    return new Promise(async (resolve, reject) => {
      try {
        const baseExt = await nftContract.methods.baseExtension().call()
        setBaseExtension(baseExt)
      } catch (e) {}

      nftContract.methods.cost().call().then((cost) => {
        console.log(cost)
        setMintCost(cost)
        nftContract.methods.maxMintAmountPerTx().call().then((maxPerTx) => {
          setMintMaxCount(maxPerTx)
          resolve(true)
        }).catch ((err) => {
          console.log('>> Fail fetch max mint per tx - use 1', err)
          resolve(true)
        })
      }).catch((err) => {
        console.log('>> Fail fetch mint price', err)
        reject(err)
      })
    })
  }

  const fetchTokenUri = async (tokenId) => {
    try {
      const uri = await airdropContract.methods.tokenURI(tokenId).call()
      if (baseExtension) {
        if (uri.substr(-baseExtension.length) !== baseExtension) {
          return `${uri}${tokenId}${baseExtension}`
        }
      }
      return uri
    } catch (e) { return false }
  }

  const initOnWeb3Ready = async () => {
    if (activeWeb3 && (`${activeChainId}` == `${chainId}`)) {
      activeWeb3.eth.getAccounts().then((accounts) => {
        setAddress(accounts[0])
        const _airdropContract = new activeWeb3.eth.Contract(NftAirdropContractData.abi, nftDropContractAddress)
        setAirdropContract(_airdropContract)
        fetchERC721rInfo(_airdropContract).then((success) => {
          setNftInfoFetched(success)
        }).catch((err) => {
          console.log('>>> fail fetch nft info', err)
        })
      }).catch((err) => {
        console.log('>>> initOnWeb3Ready', err)
        processError(err)
      })
    } else {
      const _isConnected = await isMetamaskConnected()
      if (_isConnected) {
        connectWithMetamask()
      }
    }
  }

  useEffect(() => {
    if (storageData
      && storageData.chainId
      && storageData.nftCollection
    ) {
      setChainId(storageData.chainId)
      setNftDropContractAddress(storageData.nftCollection)
    }
  }, [storageData])

  useEffect(() => {
    debugLog('on useEffect activeWeb3 initOnWeb3Ready')
    if (chainId && nftDropContractAddress) {
      initOnWeb3Ready()
    }
  }, [activeWeb3, chainId, nftDropContractAddress])


  const connectWithMetamask = async () => {
    doConnectWithMetamask({
      onBeforeConnect: () => { setIsWalletConnecting(true) },
      onSetActiveChain: setActiveChainId,
      onConnected: (cId, web3) => {
        setActiveWeb3(web3)
        setIsWalletConnecting(false)
      },
      onError: (err) => {
        console.log(">>>> connectWithMetamask", err)
        processError(err)
        setIsWalletConnecting(false)
      },
      needChainId: chainId,
    })
  }

  const doMintPayable = async () => {
    if (address && airdropContract) {
      setIsMinting(true)
      addNotify(`Confirm transaction for mint NFT`)

      const mintPriceWei = new BigNumber(mintCost).multipliedBy(mintCount).toFixed()
      
      callContractMethod({
        activeWeb3,
        contract: airdropContract,
        method: 'mint',
        weiAmount: mintPriceWei,
        args: [
          mintCount
        ],
        onTrx: (txHash) => {
          console.log('>> onTrx', txHash)
          addNotify(`NFT mint TX ${txHash}`, `success`)
        },
        onSuccess: (receipt) => {
          console.log('>> onSuccess', receipt)
          addNotify(`NFT mint transaction broadcasted`, `success`)
        },
        onError: (err) => {
          console.log('>> onError', err)
          addNotify(`Fail mint NFT. ${err.message ? err.message : ''}`, `error`)
          setIsMinting(false)
        },
        onFinally: async (answer) => {
          console.log('>> onFinally', answer)
          if (
            answer?.events?.Transfer
          ) {
            const mintEvents = (mintCount == 1) ? [answer.events.Transfer] : answer.events.Transfer
            const mintedIds = mintEvents.map((mintEvent) => {
              return mintEvent.returnValues.tokenId
            })
            const newMintedNfts = await Promise.all(mintedIds.map(async (tokenId) => {
              const tokenUri = await fetchTokenUri(tokenId)
              return {
                tokenId,
                tokenUri
              }
            }))
            setMintedNFTs((prev) => {
              return [
                ...newMintedNfts,
                ...prev
              ]
            })
          }

          setIsMinting(false)
          setIsMinted(true)
        }
      })
    }
  }

  const mintChainInfo = CHAIN_INFO(chainId)
  return (
    <div className={styles.container}>
      {navBlock(`mint`)}
      {logoBlock({
        getText,
        getDesign
      })}
      <h1 className={`${styles.h1} pageTitle`}>
        {getText(`MintPage_Title`, `Mint Demo NFTs for test`)}
      </h1>
      <hr className={`${styles.divider} ${styles.spacerTop}`} />

      {!address ? (
        <>
          <div className="mintBeforeConnectWallet">
            {getText('StakePage_BeforeConnect_Text')}
          </div>
          <button disabled={isWalletConecting} className={`${styles.mainButton} primaryButton`} onClick={connectWithMetamask}>
            {isWalletConecting ? `Connecting` : `Connect Wallet`}
          </button>
          <div className="mintAfterConnectWallet">
            {getText('StakePage_AfterConnect_Text')}
          </div>
        </>
      ) : (
        <>
          {nftInfoFetched ? (
            <>
              <h2 className="mintPageSubTitle">{getText(`MintPage_Managed_Title`, `Mint NFT`)}</h2>
              <div className="mintPageTextBeforePrice">
                {getText('MintPage_TextBeforePrice')}
              </div>
              <div className={`${styles.mintPageDesc} mintPagePrice`}>
                {getText(
                  `MintPage_Managed_PriceInfo`,
                  `Mint price is %amount% %currency%`,
                  {
                    amount: fromWei(new BigNumber(mintCost).multipliedBy(mintCount).toFixed() , mintChainInfo.nativeCurrency.decimals),
                    currency: mintChainInfo.nativeCurrency.symbol,
                  }
                )}
              </div>
              <div className="mintPageTextAfterPrice">
                {getText('MintPage_TextAfterPrice')}
              </div>
              <div className={styles.mintPageMintedHolder}>
                <button disabled={isMinting} className={`${styles.mainButton} primaryButton`} onClick={doMintPayable}>
                  {isMinting
                    ? `Minting NFT...`
                    : (isMinted)
                      ? `Mint some more`
                      : `Mint NFT`
                  }
                </button>
              </div>
              {mintedNFTs.length > 0 && (
                <div className={styles.nftBoxGrid}>
                  {mintedNFTs.map((nftInfo) => {
                    return nftToken({
                      ...nftInfo,
                      isMinted: true,
                    })
                  })}
                </div>
              )}
            </>
          ) : (
            <div>{getText(`MinPage_Loading`, `Loading...`)}</div>
          )}
        </>
      )}
    </div>
  );
};

export default Mint721r;
