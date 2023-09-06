import styles from "../../styles/Home.module.css"
import { useEffect, useState } from "react"
import {
  useStateUint,
  useStateAddress
} from "../../helpers/useState"
import isImageUrl from "../../helpers/isImageUrl"
import SwitchNetworkAndCall from "../SwitchNetworkAndCall"
import FaIcon from "../FaIcon"
import adminFormRow from "../../components/adminFormRow"
import List from "../List"
import {
  AVAILABLE_NETWORKS_INFO,
  CHAIN_INFO,
  CHAINS_LIST,
  CHAIN_EXPLORER_LINK
} from "../../helpers/constants"
import deployMarketplace from "../../helpers/deployMarketplace"


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
  const [ isDeployOpened, setIsDeployOpened ] = useState( true )
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
                    },
                    onReady: () => {
                      addNotify(`Main config successfull saved`, `success`)
                    },
                    onError: (err) => {
                      addNotify(`Fail save main config`, `error`)
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
  }
  const {
      activeChainId,
  } = getActiveChain()
  const activeChainInfo = CHAIN_INFO(activeChainId)
  console.log('>> marketChainId', marketChainId)
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
          <div className={styles.adminForm}>
            {isDeployOpened && (
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
            )}
          </div>
          <div className={styles.adminFormBottom}>
            
          </div>
        </>
      )
    }
  }
}