import type { NextPage } from "next"
import { useEffect, useState } from "react"
import styles from "../styles/Home.module.css"

import { setupWeb3, switchOrAddChain, doConnectWithMetamask, isMetamaskConnected, onWalletChanged } from "../helpers/setupWeb3"
import { calcSendArgWithFee } from "../helpers/calcSendArgWithFee"
import navBlock from "../components/navBlock"
import logoBlock from "../components/logoBlock"
import { getLink } from "../helpers"
import { useRouter } from "next/router"
import useStorage from "../storage"
import fetchTokensListInfo from "../helpers/fetchTokensListInfo"
import callMPMethod from "../helpers/callMPMethod"
import nftSaleToken from "../components/nftSaleToken"
import { CHAIN_INFO, ZERO_ADDRESS } from "../helpers/constants"
import { toWei, fromWei } from "../helpers/wei"
import BigNumber from "bignumber.js"
import approveToken from "../helpers/approveToken"
import fetchUserNfts from "../helpers/fetchUserNfts"
import SellNftModal from "../components/SellNftModal"
import Paginator from "../components/Paginator"

import Web3 from 'web3'
import fetchMarketInfo from '../helpers/fetchMarketInfo'
import fetchNftContent from '../helpers/fetchNftContent'
import Web3ObjectToArray from '../helpers/Web3ObjectToArray'
import { NftIsApproved } from '../helpers/nftApproveUtils'
import { getAssets } from "/helpers/getAssets"

import Header from '/components/Header'

const debugLog = (msg) => { console.log(msg) }


const MarketplaceV2: NextPage = (props) => {
  const {
    storageData,
    storageData: {
      isBaseConfigReady,
    },
    isOwner,
    addNotify,
    getText,
    getDesign,
    openConfirmWindow,
    storageMenu,
  } = props

  
  const [ chainId, setChainId ] = useState(storageData?.marketplaceChainId)
  const [ marketplaceContract, setMarketplaceContract ] = useState(storageData?.marketplaceContract)

  console.log('>>> marketplaceContract', marketplaceContract)
  
  const [ nftInfo, setNftInfo ] = useState({})
  const [ nftInfoFetched, setNftInfoFetched ] = useState(false)

  const [ tokensAtSale, setTokensAtSale ] = useState([])
  const [ tokensAtSaleFetching, setTokensAtSaleFetching ] = useState(true)
  const [ tokensAtSaleCount, setTokensAtSaleCount ] = useState(0)
  const [ tokensAtSaleOffset, setTokensAtSaleOffset ] = useState(0)
  const tokensAtSaleLimit = 4
  
  const [ marketInfo, setMarketInfo ] = useState({})
  const [ marketInfoFetched, setMarketInfoFetched ] = useState(false)

  const [ allowedERC20Info, setAllowedERC20Info ] = useState({}) 

  const [activeChainId, setActiveChainId] = useState(false)
  const [activeWeb3, setActiveWeb3] = useState(false)
  const [address, setAddress] = useState(false)

  const [airdropContract, setAirdropContract] = useState(false)

  const [isWalletConecting, setIsWalletConnecting] = useState(false)

  const [ currentLot, setCurrentLot ] = useState(false)
  const [ isApproving, setIsApproving ] = useState(false)

  const TABS = {
    ALL: 'ALL',
    USER: 'USER'
  }

  const [ activeTab, setActiveTab ] = useState(TABS.ALL)
  const doSwitchTab = (tab) => {
    setActiveTab(tab)
    switch (tab) {
      case TABS.ALL:
        goToPage(0)
        break;
      case TABS.USER:
        doFetchUserNfts()
        doFetchOtherUserNfts()
        break;
    }
  }

  const doApproveAndBuy = (lotIndex) => {
    addNotify(`Approving... Confirm transaction`)

    const {
      erc20,
      price,
    } = tokensAtSale[lotIndex]

    setIsApproving(true)
    approveToken({
      activeWeb3,
      chainId,
      tokenAddress: erc20,
      approveFor: marketplaceContract,
      weiAmount: price.toString(),
      onTrx: (hash) => {
        addNotify(`Approving TX hash ${hash}`, `success`)
      },
      onFinally: () => {
        addNotify(`Approved`, `success`)
        setIsApproving(false)
        doBuyLot(lotIndex)
      },
      onError: (err) => {
        setIsApproving(false)
        addNotify(`Fail approve token. ${err.message ? err.message : ''}`, `error`)
      }
    })
  }

  const [ tokensUrls, setTokensUrls ] = useState({})
  
  const doFetchTokenUrls = (tokenIds) => {
    console.log('>>> call doFetchTokenUrls', tokenIds)
    if (marketInfo && marketInfoFetched && marketInfo.marketNft) {
      console.log('>>> call do')
      fetchNftContent({
        address: marketInfo.marketNft,
        chainId,
        ids: tokenIds
      }).then((urls) => {
        setTokensUrls({
          ...tokensUrls,
          ...urls
        })
      })
    }
  }
  
  const [ isRemoveFromTrade, setIsRemoveFromTrade ] = useState(false)
  
  const doRemoveFromTrade = (lotIndex) => {
    const {
      tokenId
    } = tokensAtSale[lotIndex]

    openConfirmWindow({
      title: `Remove lot from marketplace`,
      message: `Do you want remove NFT #${tokenId.toString()} from marketplace?`,
      onConfirm: () => {
        setIsRemoveFromTrade(true)
        addNotify(`Removing NFT from marketplace. Confirm transaction`)
        callMPMethod({
          activeWeb3,
          contractAddress: marketplaceContract,
          method: 'deSellNFT',
          args: [
            tokenId.toString()
          ],
          onTrx: (txHash) => {
            console.log('>> onTrx', txHash)
            addNotify(`Remove NFT from marketplace TX ${txHash}`, `success`)
          },
          onSuccess: (receipt) => {},
          onError: (err) => {
            console.log('>> onError', err)
            addNotify(`Fail remove NFT. ${err.message ? err.message : ''}`, `error`)
            setIsRemoveFromTrade(false)
          },
          onFinally: (answer) => {
            addNotify(`NFT successfull removed from marketplace`, `success`)
            setIsRemoveFromTrade(false)
            refreshTokensAtSale()
          }
        })
      }
    })
  }

  const [ isBuying, setIsBuying ] = useState(false)
  const doBuyLot = (lotIndex) => {
    openConfirmWindow({
      title: `Buying NFT`,
      message: `Do you want buy NFT #${tokensAtSale[lotIndex].tokenId.toString()}?`,
      onConfirm: () => {
        addNotify(`Buying NFT. Confirm transaction`)
        setIsBuying(true)
        callMPMethod({
          activeWeb3,
          contractAddress: marketplaceContract,
          method: tokensAtSale[lotIndex].erc20 == ZERO_ADDRESS ? 'buyNFT' : 'buyNFTbyERC20',
          ...(tokensAtSale[lotIndex].erc20 == ZERO_ADDRESS
            ? {
              weiAmount: tokensAtSale[lotIndex].price.toString()
            } : {}
          ),
          args: [
            tokensAtSale[lotIndex].tokenId.toString()
          ],
          onTrx: (txHash) => {
            console.log('>> onTrx', txHash)
            addNotify(`Buy NFT TX ${txHash}`, `success`)
          },
          onSuccess: (receipt) => {},
          onError: (err) => {
            console.log('>> onError', err)
            addNotify(`Fail buy NFT. ${err.message ? err.message : ''}`, `error`)
            setIsBuying(false)
          },
          onFinally: (answer) => {
            addNotify(`NFT success buyed`, `success`)
            setIsBuying(false)
            doSwitchTab(TABS.USER)
          }
        })
      }
    })
  }

  const [ userNfts, setUserNfts ] = useState([])
  const [ reloadUserNfts, setReloadUserNfts ] = useState(true)
  const [ isUserNftsFetching, setIsUserNftsFetching ] = useState(false)

  const doFetchUserNfts = () => {
    if (chainId && marketplaceContract && address) {
      setIsUserNftsFetching(true)
      fetchMarketInfo({
        address: marketplaceContract,
        chainId,
        userAddress: address,
      }).then((info) => {
        console.log(info)
        setUserNfts(Web3ObjectToArray(info.tokens))
        setIsUserNftsFetching(false)
        doFetchTokenUrls(Web3ObjectToArray(info.tokens).map((tokenInfo) => { return tokenInfo.tokenId }))
      })
    }
  }
  
  const [ otherUserNfts, setOtherUserNfts ] = useState([])
  const [ isOtherUserNftsFetching, setIsOtherUserNftsFetching ] = useState(false)
  
  const doFetchOtherUserNfts = () => {
    if (chainId && marketInfo && marketInfo.marketNft && address) {
      setIsOtherUserNftsFetching(true)
      fetchUserNfts({
        chainId,
        walletAddress: address,
        nftAddress: marketInfo.marketNft
      }).then((nfts) => {
        setOtherUserNfts(nfts)
        const userNftsUrls = {}
        nfts.forEach((info) => {
          userNftsUrls[info.tokenId] = info.tokenURI
        })
        setTokensUrls({
          ...tokensUrls,
          ...userNftsUrls
        })
        setIsOtherUserNftsFetching(false)
      }).catch((err) => {
        console.log('>>> fail fetch other user nfts', err)
        setIsOtherUserNftsFetching(false)
      })
    }
  }


  const [ isSellNft, setIsSellNft ] = useState(false)
  const [ sellNftInfo, setSellNftInfo ] = useState({})
  const doSellNft = (lotIndex) => {
    setSellNftInfo(otherUserNfts[lotIndex])
    setIsSellNft(true)
  }


  const [ allowedERC20InfoFetching, setAllowedERC20InfoFetching ] = useState(false)
  const [ allowedERC20InfoFetched, setAllowedERC20InfoFetched ] = useState(false)
  useEffect(() => {
    if (marketInfo && marketInfoFetched) {
      if (Web3ObjectToArray(marketInfo.allowedERC20).length > 0) {
        setAllowedERC20InfoFetching(true)
        setAllowedERC20InfoFetched(false)
        fetchTokensListInfo({
          erc20list: Web3ObjectToArray(marketInfo.allowedERC20),
          chainId,
          withAllowance: (address) ? {
            allowanceFrom: address,
            allowanceTo: marketplaceContract
          } : false
        }).then((answ) => {
          setAllowedERC20Info(answ)
          setAllowedERC20InfoFetching(false)
          setAllowedERC20InfoFetched(true)
        }).catch((err) => {
          console.log('Fail fetch allowed erc20 info', err)
          setAllowedERC20InfoFetched(true)
          setAllowedERC20InfoFetching(false)
        })
      } else {
        setAllowedERC20InfoFetched(true)
      }
    }
  }, [ marketInfo ])


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


  const refreshTokensAtSale = () => {
    goToPage(tokensAtSaleOffset)
    doFetchUserNfts()
  }

  const initOnWeb3Ready = async () => {
    if (activeWeb3 && (`${activeChainId}` == `${chainId}`)) {
      window.tt = activeWeb3
      activeWeb3.eth.getAccounts().then((accounts) => {
        setAddress(accounts[0])

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

  const [ isNeedReload, setIsNeedReload ] = useState(false)
  const [ refreshIndex, setRefreshIndex ] = useState(0)
  useEffect(() => {
    if (isNeedReload) {
      setIsNeedReload(false)
      goToPage(0)
      doFetchUserNfts()
      doFetchOtherUserNfts()
    }
  }, [ isNeedReload ])
  
  useEffect(() => {
    onWalletChanged(async (newAccount) => {
      setAddress(newAccount)
      setIsNeedReload(true)
    })
  }, [])

  
  const goToPage = (offset) => {
    if (chainId && marketplaceContract) {
      setTokensAtSaleFetching(true)
      fetchMarketInfo({
        address: marketplaceContract,
        chainId,
        offset,
        limit: tokensAtSaleLimit,
        onlyTokens: true,
      }).then((info) => {
        setTokensAtSale(Web3ObjectToArray(info.tokensAtSale))
        setTokensAtSaleFetching(false)
        doFetchTokenUrls(Web3ObjectToArray(info.tokensAtSale).map((tokenInfo) => { return tokenInfo.tokenId }))
      })
    }
  }

  useEffect(() => {
    if (marketInfoFetched) {
      doFetchTokenUrls(tokensAtSale.map((tokenInfo) => { return tokenInfo.tokenId }))
    }
  }, [ marketInfoFetched ])

  useEffect(() => {
    if (chainId && marketplaceContract) {
      const chainInfo = CHAIN_INFO(chainId)
      if (chainInfo) {
        try {
          const web3 = new Web3(chainInfo.rpcUrls[0])
          setActiveWeb3(web3)
          fetchMarketInfo({
            address: marketplaceContract, 
            chainId,
            offset: tokensAtSaleOffset,
            limit: tokensAtSaleLimit
          }).then((_marketInfo) => {
            setMarketInfo(_marketInfo)
            
            setTokensAtSaleCount(_marketInfo.tokensAtSaleCount)
            setTokensAtSale(Web3ObjectToArray(_marketInfo.tokensAtSale))
            setTokensAtSaleFetching(false)
            setMarketInfoFetched(true)
            if (address) {
              doFetchOtherUserNfts()
            }
          }).catch((err) => {
            console.log('>>> fail fetch market info', err)
          })
        } catch (err) {
          console.log('>>> err', err)
        }
      }
    }
  }, [ chainId, marketplaceContract])
  
  useEffect(() => {
    if (storageData
      && storageData.marketplaceChainId
      && storageData.marketplaceContract
    ) {
      setChainId(storageData.marketplaceChainId)
      setMarketplaceContract(storageData.marketplaceContract)
    }
  }, [storageData])

  useEffect(() => {
    if (activeWeb3 && chainId && marketplaceContract) {
      initOnWeb3Ready()
    }
  }, [activeWeb3, chainId, marketplaceContract])


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

  const chainInfo = CHAIN_INFO(chainId)
  const nativeCurrency = chainInfo.nativeCurrency
  
  return (
    <div className={styles.container}>
      {/*<Header page={`marketplace`} />*/}
      {navBlock(`marketplace`)}
      {logoBlock({
        getText,
        getDesign
      })}
      <h1 className={`${styles.h1} pageTitle`}>
        {getText(`MarketPage_Title`, `NFTs Marketplace`)}
      </h1>

      <hr className={`${styles.divider} ${styles.spacerTop}`} />

      <>
        {!address ? (
          <>
            <div className="mpBeforeConnectWallet">
              {getText('MarketPage_BeforeConnect_Text')}
            </div>
            <button disabled={isWalletConecting} className={`${styles.mainButton} primaryButton`} onClick={connectWithMetamask}>
              {isWalletConecting ? `Connecting` : `Connect Wallet`}
            </button>
            <div className="mpAfterConnectWallet">
              {getText('MarketPage_AfterConnect_Text')}
            </div>
          </>
        ) : (
          <h4>Connected wallet {address}</h4>
        )}
        {marketInfoFetched && allowedERC20InfoFetched ? (
          <>
            <nav>
              <strong>Show:</strong>
              <a onClick={() => { doSwitchTab(TABS.ALL) }}>All</a>
              {address && (<a onClick={() => { doSwitchTab(TABS.USER) }}>Your</a>)}
            </nav>
            <h3>
              {activeTab === TABS.ALL && (<>All NFTs on sale</>)}
              {activeTab === TABS.USER && (<>Your NFTs on sale</>)}
            </h3>
            <style jsx>
              {`
                .loadingHolder {
                  position: relative;
                }
                .loading {
                  display: block;
                  position: absolute;
                  left: 0px;
                  top: 0px;
                  bottom: 0px;
                  right: 0px;
                  min-height: 64px;
                  background: url(${getAssets('images/nft-media-loading.svg')});
                  background-position: center;
                  background-size: contain;
                  background-repeat: no-repeat;
                }
              `}
            </style>
            <div className={`${styles.nftBoxGrid} loadingHolder`}>
              {(activeTab === TABS.ALL ? tokensAtSale : userNfts ).map((lotInfo, lotIndex) => {
                const {
                  uri,
                  tokenId,
                  erc20,
                  seller
                } = lotInfo
                
                const price = fromWei(
                  lotInfo.price,
                  erc20 == ZERO_ADDRESS
                    ? nativeCurrency.decimals
                    : allowedERC20Info[erc20].decimals
                )
                let needApprove = false
                if (erc20 != ZERO_ADDRESS) {
                  needApprove = new BigNumber(lotInfo.price.toString()).isGreaterThan( allowedERC20Info[erc20].allowance)
                }
                return nftSaleToken({
                  refreshIndex,
                  currentUser: address || '',
                  isWalletConnected: address,
                  tokenId: tokenId.toString(),
                  tokenUri: tokensUrls[tokenId.toString()] || false,
                  price,
                  needApprove,
                  seller,
                  isERC: (erc20 != ZERO_ADDRESS),
                  currency: erc20 == ZERO_ADDRESS ? nativeCurrency.symbol : allowedERC20Info[erc20].symbol,
                  openConfirmWindow,
                  isApproving,
                  isBuying,
                  isActive: (lotIndex === currentLot),
                  isRemoveFromTrade,
                  isBaseConfigReady,
                  onRemoveFromTrade: () => {
                    setCurrentLot(lotIndex)
                    doRemoveFromTrade(lotIndex)
                  },
                  onBuy: () => {
                    setCurrentLot(lotIndex)
                    doBuyLot(lotIndex)
                  },
                  onApproveAndBuy: () => {
                    setCurrentLot(lotIndex)
                    doApproveAndBuy(lotIndex)
                  }
                })
                
              })}
              
              {activeTab === TABS.ALL && tokensAtSaleFetching && (
                <div className="loading"></div>
              )}
              {activeTab === TABS.USER && isUserNftsFetching && (
                <div className="loading"></div>
              )}
            </div>
            {activeTab === TABS.USER && address && (
              <>
                <h2>Your NFTs</h2>
                <hr className={`${styles.divider} ${styles.spacerTop}`} />
                <div className={styles.nftBoxGrid}>
                  {otherUserNfts.length > 0 ? (
                    <>
                      {otherUserNfts.map((info, lotIndex) => {
                        return nftSaleToken({
                          tokenId: info.tokenId.toString(),
                          tokenUri: info.tokenURI,
                          openConfirmWindow,
                          isUserNFT: true,
                          isTradeAllow: true,
                          onAddToTrade: () => { doSellNft(lotIndex) }
                        })
                      })}
                    </>
                  ) : (
                    <div>You are dont have any NFTs</div>
                  )}
                </div>
                {isSellNft && (
                  <SellNftModal {...{
                    activeWeb3,
                    openConfirmWindow,
                    addNotify,
                    nftInfo: sellNftInfo,
                    chainId,
                    nftContract: marketInfo.marketNft,
                    userAddress: address,
                    marketplaceContract,
                    isBaseConfigReady,
                    allowedERC20Info,
                    tradeFee: marketInfo.tradeFee,
                    onClose: () => { setIsSellNft(false) },
                    onSelled: () => {
                      setIsSellNft(false)
                      doFetchUserNfts()
                      doFetchOtherUserNfts()
                    }
                  }} />
                )}
              </>
            )}
            {activeTab === TABS.ALL && (
              <Paginator
                page={ Math.ceil(tokensAtSaleOffset / tokensAtSaleLimit) }
                perPage={tokensAtSaleLimit}
                itemsCount={tokensAtSaleCount} 
                onNavigate={(page) => {
                  console.log('>> go to page', page)
                  setTokensAtSaleOffset( page * tokensAtSaleLimit )
                  goToPage( page * tokensAtSaleLimit )
                }}
              />
            )}
          </>
        ) : (
          <div>Loading</div>
        )}
      </>
    </div>
  );
};

export default MarketplaceV2;
