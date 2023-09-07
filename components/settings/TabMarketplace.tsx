import styles from "/styles/Home.module.css"
import { useEffect, useState } from "react"
import {
  useStateUint,
  useStateAddress
} from "/helpers/useState"
import isImageUrl from "/helpers/isImageUrl"
import SwitchNetworkAndCall from "../SwitchNetworkAndCall"
import FaIcon from "../FaIcon"
import adminFormRow from "/components/adminFormRow"
import AdminInfoRow from "/components/AdminInfoRow"
import List from "../List"
import ListView from "../ListView"

import {
  AVAILABLE_NETWORKS_INFO,
  CHAIN_INFO,
  CHAINS_LIST,
  CHAIN_EXPLORER_LINK
} from "/helpers/constants"
import deployMarketplace from "/helpers/deployMarketplace"
import fetchMarketInfo from '/helpers/fetchMarketInfo'
import Web3ObjectToArray from '/helpers/Web3ObjectToArray'
import callMPMethod from "/helpers/callMPMethod"

export default function TabMarketplace(options) {
  const {
    openConfirmWindow,
    addNotify,
    saveStorageConfig,
    saveExStorageConfig,
    storageData,
    getActiveChain,
    chainId,
    activeAccount,
  } = options

  const [ isSaveChanges, setIsSaveChanges ] = useState(false)
  
  
  const doSaveChanges = () => {
    openConfirmWindow({
      title: `Save changes`,
      message: `Save Mint page changes to storage config?`,
      onConfirm: () => {
        /*
        setIsSaveChanges(true)
        saveStorageConfig({
          newData: {
            mintType: newMintType
          },
          onBegin: () => {
            addNotify(`Confirm transaction for save main config`)
          },
          onReady: () => {
            addNotify(`Main config successfull saved`, `success`)
            setIsSaveChanges(false)
          },
          onError: (err) => {
            addNotify(`Fail save main config`, `error`)
            setIsSaveChanges(false)
          }
        })
        */
      }
    })
  }

  useEffect(() => {
  }, [])

  

  const [ marketplaceContract, setMarketplaceContract ] = useState(``)

  const [ marketChainId, setMarketChainId ] = useState(chainId)
  const [ isDeployOpened, setIsDeployOpened ] = useState( false )
  const [ nftCollection, setNftCollection, nftCollectionError ] = useStateAddress('')
  const [ tradeFee, setTradeFee ] = useStateUint(10)
  const [ feeReceiver, setFeeReceiver ] = useStateAddress(activeAccount) 
  const [ allowedERC20, setAllowedERC20 ] = useState([])
  const [ isDeploying, setIsDeploying ] = useState(false)
  
  const showAlert = (title, message) => {
    openConfirmWindow({
      title: title,
      message: message,
      onConfirm: () => {},
      isOk: true
    })
  }

  const doDeployMarketplace = () => {
    if (!marketChainId) return showAlert(`Fill settings first`, `Specify chain id`)
    if (!nftCollection) return showAlert(`Fill settings first`, `Specify NFT collection`)
    if (!feeReceiver) return showAlert(`Fill settings first`, `Specify fee receiver address`)

    const marketChainInfo = CHAIN_INFO(marketChainId)

    openConfirmWindow({
      title: `Deploying new MarketPlace contract`,
      message: `Do you want deploy new MarketPlace contract atn ${marketChainInfo.chainName} (${marketChainId})?`,
      onConfirm: () => {
        setIsDeploying(true)
        const {
          activeWeb3,
        } = getActiveChain()
        deployMarketplace({
          activeWeb3,
          nftCollection,
          tradeFee,
          feeReceiver,
          allowedERC20,
          onTrx: (hash) => {
            addNotify(`MarketPlace collection deploy TX ${hash}...`, `success`)
          },
          onSuccess: (newContractAddress) => {
            try {
              addNotify(`MarketPlace collection deployed. Now save settings`, `success`)
              setIsDeploying(false)
              setMarketplaceContract(newContractAddress)
              setExistsMPContract(newContractAddress)
              setExistsMPChainId(marketChainId)
              setExistsMPReload(true)
              setConfigureExistOpened(true)
              setIsDeployOpened(false)
              openConfirmWindow({
                title: `Save MarketPlace contract to config`,
                message: `Save deployed MarketPlace ${newContractAddress} to config?`,
                onConfirm: () => {
                  saveStorageConfig({
                    newData: {
                      marketplaceContract: newContractAddress,
                      marketplaceChainId: marketChainId,
                    },
                    onBegin: () => {
                      addNotify(`Confirm transaction for save main config`)
                      setIsSaveMainSettings(true)
                    },
                    onReady: () => {
                      addNotify(`Main config successfull saved`, `success`)
                      setDeployedMPContract(newContractAddress)
                      setDeployedMPChainId(marketChainId)
                      setConfigureExistOpened(false)
                      setIsSaveMainSettings(false)
                    },
                    onError: (err) => {
                      addNotify(`Fail save main config`, `error`)
                      setIsSaveMainSettings(false)
                    }
                  })
                }
              })
            } catch (err) {
              console.log('>>> onSuccess error', err)
            }
          },
          onError: (err) => {
            addNotify(`Fail deploy MarketPlace. ${(err.message ? err.message : '')}`, `error`)
            setIsDeploying(false)
            console.log(err)
          }
        }).catch((err) => {
          setIsDeploying(false)
          addNotify(`Fail deploy MarketPlace. ${err.message ? err.message : ''}`, `error`)
        })
      }
    })
  }

  const doCloseDeploy = () => {
    setIsDeployOpened(false)
  }
  

  window.cleanUpMP = () => {
    saveStorageConfig({
      newData: {
        marketplaceContract: '',
        marketplaceChainId: '',
      },
      onBegin: () => {
        addNotify(`Confirm transaction for save main config`)
      },
      onReady: () => {
        addNotify(`Main config successfull saved`, `success`)
      },
      onError: (err) => {
        addNotify(`Fail save main config`, `error`)
      }
    })
  }
  

  const [ deployedMPContract, setDeployedMPContract ] = useState(storageData.marketplaceContract)
  const [ deployedMPChainId, setDeployedMPChainId ] = useState(storageData.marketplaceChainId)
  const [ deployedMPInfo, setDeployedMPInfo ] = useState(false)
  const [ needReloadContract, setNeedReloadContract ] = useState(false)
  /* Edit MarketPlace */
  const [ isEditFeeReciever, setIsEditFeeReciever ] = useState(false)
  const [ newFeeReciever, setNewFeeReciever ] = useStateAddress(deployedMPInfo?.feeReceiver)
  const [ newTradeFee, setNewTradeFee ] = useStateUint(deployedMPChainInfo?.tradeFee)
  const [ newAllowedERC20, setNewAllowedERC20 ] = useState(Web3ObjectToArray(deployedMPInfo.allowedERC20))

  const [ isSaveMainSettings, setIsSaveMainSettings ] = useState(false)
  useEffect(() => {
    if (deployedMPChainId && deployedMPContract) {
      setNeedReloadContract(false)
      fetchMarketInfo({
        address: deployedMPContract,
        chainId: deployedMPChainId,
        offset: 0,
        limit: 0,
      }).then((info) => {
        console.log('>> MP info', info)
        setDeployedMPInfo(info)
      })
    }
  }, [ deployedMPContract, deployedMPChainId, needReloadContract])

  const saveMPSetting = (method, args) => {
    return new Promise((resolve, reject) => {
      openConfirmWindow({
        title: `Saving MarketPlace settings`,
        message: `Save changes to MarketPlace contract?`,
        onConfirm: () => {
          const {
              activeChainId,
              activeWeb3
          } = getActiveChain()

          if (activeChainId === deployedMPChainId) {
            addNotify(`Saving changes to contract. Confirm transaction`)
            callMPMethod({
              activeWeb3,
              contractAddress: deployedMPContract,
              method,
              args,
              onTrx: (txHash) => {
                addNotify(`Saving changes TX ${txHash}`, `success`)
              },
              onSuccess: (receipt) => {},
              onError: (err) => {
                resolve(false)
                addNotify(`Fail save changes. ${err.message ? err.message : ''}`, `error`)
              },
              onFinally: (answer) => {
                addNotify(`Changes successfully saved`, `success`)
                resolve(true)
                setNeedReloadContract(true)
              }
            })
          } else {
            resolve(false)
            const marketChainInfo = CHAIN_INFO(deployedMPChainId)
            openConfirmWindow({
              title: `Fail save MarketPlace settings`,
              message: `Change your network to ${marketChainInfo.chainName} (${deployedMPChainId})`,
              isOk: true,
            })
          }
        },
        onCancel: () => {
          resolve(false)
        }
      })
    })
  }
  // Configure exists contract
  const [ configureExistOpened, setConfigureExistOpened ] = useState(false)
  const [ existsMPChainId, setExistsMPChainId ] = useStateUint(0)
  const [ existsMPContract, setExistsMPContract ] = useStateAddress('')
  const [ isExistsMPReload, setExistsMPReload ] = useState(false)
  const [ isExistsMPFetched, setIsExistsMPFetched ] = useState(false)
  const [ isExistsMPFetching, setIsExistsMPFetching ] = useState(false)
  const [ existsMPInfo, setExistMPInfo ] = useState(false)
  const [ isExistsMPSaving, setIsExistsMPSaving ] = useState(false)

  useEffect(() => {
    if (isExistsMPReload) {
      setExistsMPReload(false)
      _doFetchExistsInfo()
    }
  }, [ isExistsMPReload ])
  useEffect(() => {
    setIsExistsMPFetched(false)
  }, [ existsMPChainId, existsMPContract ])
  
  const _doFetchExistsInfo = () => {
    setIsExistsMPFetched(false)
    setIsExistsMPFetching(true)
    fetchMarketInfo({
      address: existsMPContract,
      chainId: existsMPChainId,
      offset: 0,
      limit: 0,
    }).then((info) => {
      if (info && info.isMPContract) {
        setIsExistsMPFetched(true)
        setExistMPInfo(info)
      } else {
        showAlert(`Fail fetch info`, `Specified contract is not MarketPlace`)
      }
      setIsExistsMPFetching(false)
    }).catch((err) => {
      showAlert(`Fail fetch info`, `Fail fetch info. May be contract is not MarketPlace`)
      setIsExistsMPFetching(false)
    })
  }
  const doFetchExistsInfo = () => {
    if (!existsMPChainId) return showAlert(`Error`, `Specify Chain Id`)
    if (!existsMPContract) return showAlert(`Error`, `Specify contract address`)
    _doFetchExistsInfo()
  }
  const doExistsSave = () => {
    openConfirmWindow({
      title: `Save MarketPlace contract to config`,
      message: `Save deployed MarketPlace ${existsMPContract} to config?`,
      onConfirm: () => {
        saveStorageConfig({
          newData: {
            marketplaceContract: existsMPContract,
            marketplaceChainId: existsMPChainId,
          },
          onBegin: () => {
            addNotify(`Confirm transaction for save main config`)
            setIsSaveMainSettings(true)
          },
          onReady: () => {
            addNotify(`Main config successfull saved`, `success`)
            setDeployedMPContract(existsMPContract)
            setDeployedMPChainId(existsMPChainId)
            setConfigureExistOpened(false)
            setIsSaveMainSettings(false)
          },
          onError: (err) => {
            addNotify(`Fail save main config`, `error`)
            setIsSaveMainSettings(false)
          }
        })
      }
    })
  }
  const doCancelExistsSave = () => {
    setConfigureExistOpened(false)
  }
  
  const {
      activeChainId,
  } = getActiveChain()
  const activeChainInfo = CHAIN_INFO(activeChainId)


  const deployedMPChainInfo = CHAIN_INFO(deployedMPChainId)
  return {
    updateState: (newState) => {
      const {
        activeAccount,
        activeChainId
      } = newState
      setFeeReceiver(activeAccount)
      setMarketChainId(activeChainId)
    },
    setMarketChainId,
    render: () => {
      return (
        <>
          {!isDeployOpened && !configureExistOpened && !deployedMPContract && !deployedMPChainId && (
            <div className={styles.adminForm}>
              <div className={styles.adminInfoError}>
                <span>MarketPlace contract not configured.</span>
                <span>Specify exist contract or deploy new</span>
              </div>
            </div>
          )}
          {configureExistOpened && (
            <div className={styles.adminForm}>
              <div className={styles.subFormInfo}>
                <h3>Setup exists MarketPlace contract</h3>
                {adminFormRow({
                  label: `Chain ID`,
                  type: `list`,
                  values: CHAINS_LIST,
                  value: existsMPChainId,
                  onChange: setExistsMPChainId,
                  subForm: true
                })}
                <div className={styles.infoRow}>
                  <label>MarketPlace contract:</label>
                  <div>
                    <div>
                      <input type="text" value={existsMPContract} onChange={(e) => { setExistsMPContract(e) }} />
                    </div>
                  </div>
                </div>
                {isExistsMPFetched && existsMPInfo && (
                  <>
                    <AdminInfoRow label={`Owner`} value={existsMPInfo.owner} />
                    <AdminInfoRow label={`NFT Collection`} value={existsMPInfo.marketNft} />
                    <AdminInfoRow label={`Trade fee`} value={existsMPInfo.tradeFee} />
                    <AdminInfoRow label={`Fee receiver`} value={existsMPInfo.feeReceiver} />
                    <AdminInfoRow label={`Allowed ERC20`} value={(<ListView items={Web3ObjectToArray(existsMPInfo.allowedERC20)} />)} />
                  </>
                )}
                <div className={styles.actionsRow}>
                  {!isExistsMPFetched && (
                    <button disabled={isExistsMPFetching || isSaveMainSettings} className={styles.adminButton} onClick={doFetchExistsInfo}>
                      Fetch info about contract before save
                    </button>
                  )}
                  {isExistsMPFetched && existsMPInfo && existsMPInfo.isMPContract && (
                    <SwitchNetworkAndCall
                      chainId={`STORAGE`}
                      className={styles.adminButton}
                      disabled={isExistsMPSaving || isSaveMainSettings}
                      onClick={doExistsSave}
                      action={`Save contract info`}
                    >
                      Save contract info
                    </SwitchNetworkAndCall>
                  )}
                  <button disabled={isExistsMPSaving || isExistsMPFetching || isSaveMainSettings} className={styles.adminButton} onClick={doCancelExistsSave}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          {deployedMPContract && deployedMPChainId && !isDeployOpened && !configureExistOpened && (
            <div className={styles.adminForm}>
              <div className={styles.subFormInfo}>
                <h3>Deployed MarketPlace info</h3>
                <AdminInfoRow label={`MarketPlace Chain Id`} value={(<>{deployedMPChainInfo.chainName} ({deployedMPChainId})</>)} />
                <AdminInfoRow label={`MarketPlace address`} value={deployedMPContract} />
                {deployedMPInfo && (
                  <>
                    <AdminInfoRow label={`Owner`} value={deployedMPInfo.owner} />
                    <AdminInfoRow label={`NFT collection`} value={deployedMPInfo.marketNft} />
                    <AdminInfoRow {...{
                      label: `Trade fee %`,
                      value: deployedMPInfo.tradeFee,
                      canEdit: true,
                      editView: () => {
                        return (
                          <input type="text" value={newTradeFee} onChange={(e) => { setNewTradeFee(e) }} />
                        )
                      },
                      onEdit: () => { setNewTradeFee(deployedMPInfo.tradeFee) },
                      onSave: () => {
                        return saveMPSetting(`setTradeFee`, [newTradeFee])
                      }
                    }} />
                    <AdminInfoRow {...{
                      label: `Fee receiver`,
                      value: deployedMPInfo.feeReceiver,
                      canEdit: true,
                      editView: () => {
                        return (
                          <input type="text" value={newFeeReciever} onChange={(e) => { setNewFeeReciever(e) }} />
                        )
                      },
                      onEdit: () => { setNewFeeReciever(deployedMPInfo.feeReceiver) },
                      onSave: () => {
                        if (newFeeReciever) {
                          return saveMPSetting(`setFeeReceiver`, [newFeeReciever])
                        }
                      }
                    }} />
                    <AdminInfoRow {...{
                      label: `Allowed ERC20`,
                      value: (
                        <ListView items={Web3ObjectToArray(deployedMPInfo.allowedERC20)} />
                      ),
                      canEdit: true,
                      injectedButtons: true,
                      editView: (buttons) => {
                        return (
                          <List items={newAllowedERC20} onChange={(v) => { setNewAllowedERC20(v) }} buttons={buttons} />
                        )
                      },
                      onEdit: () => { setNewAllowedERC20(Web3ObjectToArray(deployedMPInfo.allowedERC20)) },
                      onSave: () => {
                        return saveMPSetting(`setAllowedERC20`, [newAllowedERC20])
                      }
                    }} />
                  </>
                )}
              </div>
            </div>
          )}
          {isDeployOpened && (
            <div className={styles.adminForm}>
              <div className={styles.subFormInfo}>
                <h3>Deploy new MarketPlace</h3>
                {adminFormRow({
                  label: `Chain ID`,
                  type: `list`,
                  values: CHAINS_LIST,
                  value: marketChainId,
                  onChange: setMarketChainId,
                  subForm: true
                })}
                <div className={styles.infoRow}>
                  <label>NFT Collection:</label>
                  <div>
                    <div>
                      <input type="text" value={nftCollection} onChange={(e) => { setNftCollection(e) }} />
                    </div>
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <label>Trade fee:</label>
                  <div>
                    <div>
                      <input type="number" min="0" max="30" value={tradeFee} onChange={(e) => { setTradeFee(e) }} />
                      <strong>%</strong>
                    </div>
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <label>Fee receiver:</label>
                  <div>
                    <input type="text" value={feeReceiver} onChange={(e) => { setFeeReceiver(e) }} />
                  </div>
                </div>
                <div className={styles.infoRow}>
                  <label>Allowed ERC20 for trade:</label>
                  <div>
                    <div>
                      <strong className={styles.inputInfo}>List of token contracts that can be used for trading on par with native currency</strong>
                    </div>
                    <div>
                      <List items={allowedERC20} onChange={(v) => { setAllowedERC20(v) }} />
                    </div>
                  </div>
                </div>
                <div className={styles.actionsRow}>
                  <SwitchNetworkAndCall
                    chainId={marketChainId}
                    className={styles.adminButton}
                    disabled={isDeploying}
                    onClick={doDeployMarketplace}
                    action={`Deploy`}
                  >
                    Deploy
                  </SwitchNetworkAndCall>
                  <button disabled={isDeploying} className={styles.adminButton} onClick={doCloseDeploy}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          {!isDeployOpened && !configureExistOpened && (
            <>
              <div className={styles.adminFormBottom}>
                <button className={styles.adminButton} onClick={() => { setConfigureExistOpened(true) }}>
                  Configure exist MarketPlace contract
                </button>
              </div>
              <div className={styles.adminFormBottom}>
                <button className={styles.adminButton} onClick={() => { setIsDeployOpened(true) }}>
                  Deploy new MarketPlace contract
                </button>
              </div>
            </>
          )}
        </>
      )
    }
  }
}