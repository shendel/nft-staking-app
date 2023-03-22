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
    id: `STAKE`,
    title: `Use Mint NFTStake token`,
  },
  {
    id: `ERC721R`,
    title: `Use Mint for ERC721r`,
  },
]

const MINT_TYPE_DESCRIPTION = {
  DISABLED: `Страница минта нфт будет не доступна пользователям`,
  DEMO: `Будет использоваться страница для минта демо нфт (для тестирования функционала скрипта)`,
  STAKE: `Будет использоваться страница для минта NFTStake. Контракт этого токена создается через админ-панель скрипта. Этот токен поддерживает маркетплейс`,
  ERC721R: `Будет использоваться страница для минта ERC721r. Используется со своим контрактом.
    У контракта должны быть доступно свойство 'cost', 'maxMintAmountPerTx', а так-же должен быть метод mint(uint quantity)`
}
export default function TabMintSettings(options) {
  const {
    openConfirmWindow,
    addNotify,
    saveStorageConfig,
    storageData,
  } = options

  const [ isSaveChanges, setIsSaveChanges ] = useState(false)
  const [ newMintType, setNewMintType ] = useState('DEMO')
  
  const doSaveChanges = () => {
  }

  useEffect(() => {
  }, [])

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
              onChange: setNewMintType
            })}
            <div className={styles.adminSectionDescription}>{MINT_TYPE_DESCRIPTION[newMintType]}</div>
          </div>
          <div className={styles.adminFormBottom}>
            <SwitchNetworkAndCall
              chainId={`STORAGE`}
              className={styles.adminMainButton}
              disabled={isSaveChanges}
              onClick={doSaveChanges}
              action={`Save changes`}
              icon="save"
            >
              {isSaveChanges ? `Saving changes...` : `Save changes`}
            </SwitchNetworkAndCall>
          </div>
        </>
      )
    }
  }
}