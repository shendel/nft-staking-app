import styles from "../../styles/Home.module.css"
import { useEffect, useState } from "react"
import { useStateUint } from "../../helpers/useState"
import isImageUrl from "../../helpers/isImageUrl"
import SwitchNetworkAndCall from "../SwitchNetworkAndCall"
import FaIcon from "../FaIcon"
import adminFormRow from "../../components/adminFormRow"

const MINT_TYPES = [
  {
    id: `DISABLED`,
    title: `Mint page disabled`,
  },
  {
    id: `DEMO`,
    title: `Use Mint Demo NFT`,
  },
  {
    id: `NFTMARKETPLACE`,
    title: `Use Mint NFTStake token`,
  },
  {
    id: `ERC721R`,
    title: `Use Mint for ERC721r`,
  },
]

const MINT_TYPE_DESCRIPTION = {
  DISABLED: `The Mint NFT page will not be available to users`,
  DEMO: `The page for Mint demo NFT will be used (for testing the functionality of the script)`,
  NFTMARKETPLACE: `The NFTStake mint page will be used. The contract for this token is created through the admin panel of the script. This token supports the marketplace`,
  ERC721R: `The page for mint ERC721r will be used. Used with your contract.
    The contract must have the "cost", "maxMintAmountPerTx" property available, and the "mint(uint quantity)" method`
}
export default function TabMintSettings(options) {
  const {
    openConfirmWindow,
    addNotify,
    saveStorageConfig,
    saveExStorageConfig,
    storageData,
  } = options

  const [ isSaveChanges, setIsSaveChanges ] = useState(false)
  const [ newMintType, setNewMintType ] = useState(storageData.mintType)
  
  const doSaveChanges = () => {
    openConfirmWindow({
      title: `Save changes`,
      message: `Save Mint page changes to storage config?`,
      onConfirm: () => {
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
      }
    })
  }

  useEffect(() => {
  }, [])

  /*
  const testSaveExdata = () => {
  
    saveExStorageConfig({
      key: 'T2',
      data: {
        boo: 'foo',
        moo: 'xoo',
      },
      onBegin: () => {
        console.log('>>> begin')
      },
      onReady: () => {
        console.log('>>> ready')
      },
      onError: () => {
        console.log('>>> on error')
      }
    })
  }
  */
  return {
    render: () => {
      return (
        <>
          <div className={styles.adminForm}>
            {adminFormRow({
              label: `Mint Page`,
              type: `list`,
              values: MINT_TYPES,
              value: newMintType,
              onChange: setNewMintType,
              afterDesc: MINT_TYPE_DESCRIPTION[newMintType],
              buttons: (
                <SwitchNetworkAndCall
                  chainId={`STORAGE`}
                  className={styles.adminSubButton}
                  disabled={isSaveChanges}
                  onClick={doSaveChanges}
                  action={`Save changes`}
                  icon="save"
                >
                  {isSaveChanges ? `Saving Mint page type...` : `Save Mint page type`}
                </SwitchNetworkAndCall>
              )
            })}
          </div>
          <div className={styles.adminFormBottom}>
            
          </div>
        </>
      )
    }
  }
}