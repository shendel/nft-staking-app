import styles from "../../styles/Home.module.css"
import { useEffect, useState } from "react"
import { useStateUri, useStateUint } from "../../helpers/useState"
import { defaultDesign } from "../../helpers/defaultDesign"
import { getUnixTimestamp } from "../../helpers/getUnixTimestamp"
import { textsGroups } from "../../helpers/textsGroups"
import toggleGroup from "../toggleGroup"
import iconButton from "../iconButton"
import InputColor from 'react-input-color'
import SwitchNetworkAndCall from "../SwitchNetworkAndCall"

const useStateColor = useStateUri

export default function TabTexts(options) {
  const {
    setDoReloadStorage,
    saveStorageConfig,
    openConfirmWindow,
    addNotify,
    getActiveChain,
    storageTexts,
    saveExStorageConfig,
  } = options

  const [ newTexts, setNewTexts ] = useState(storageTexts)
  const [ isSaveTexts, setIsSaveTexts ] = useState(false)
  
  const _lsPreviewMode = localStorage.getItem(`-nft-stake-preview-text-mode`)
  let _lsPreviewTexts = localStorage.getItem(`-nft-stake-preview-texts`)
  try {
    _lsPreviewTexts = JSON.parse(_lsPreviewTexts)
    _lsPreviewTexts = {
      ...storageTexts,
      ..._lsPreviewTexts,
    }
  } catch (e) {
    _lsPreviewTexts = storageTexts
  }

  const [ isPreviewMode, setIsPreviewMode ] = useState(_lsPreviewMode !== null)
  
  const onPreviewDesign = () => {
    openConfirmWindow({
      title: `Switch to preview mode`,
      message: `Switch to preview mode? You can look changes before save`,
      onConfirm: () => {
        addNotify(`Preview mode on. Go to site for check it`, `success`)
        localStorage.setItem(`-nft-stake-preview-text-mode`, true)
        localStorage.setItem(`-nft-stake-preview-texts`, JSON.stringify(newTexts))
        setIsPreviewMode(true)
      }
    })
  }

  const offPreviewDesign = () => {
    addNotify(`Preview mode turn off`, `success`)
    localStorage.removeItem(`-nft-stake-preview-text-mode`)
    localStorage.removeItem(`-nft-stake-preview-texts`)
    setIsPreviewMode(false)
  }

  useEffect(() => {
    if (isPreviewMode) {
      localStorage.setItem(`-nft-stake-preview-texts`, JSON.stringify(newTexts))
      localStorage.setItem(`-nft-stake-preview-texts-utx`, getUnixTimestamp())
    }
  }, [newTexts])
  
  const doSaveTexts = () => {
    openConfirmWindow({
      title: `Save texts`,
      message: `Save changes to storage config?`,
      onConfirm: () => {
        setIsSaveTexts(true)
        saveStorageConfig({
          onBegin: () => {
            addNotify(`Confirm transaction for save changed texts`)
          },
          onReady: () => {
            addNotify(`Texts successfull saved`, `success`)
            setIsSaveTexts(false)
          },
          onError: (err) => {
            addNotify(`Fail save texts`, `error`)
            setIsSaveTexts(false)
          },
          newData: {
            texts: newTexts,
          }
        })
      }
    })
  }

  const updateStorageText = (code, newValue) => {
    setNewTexts((prev) => {
      return {
        ...prev,
        [`${code}`]: newValue,
      }
    })
  }
  const renderStorageTextArea = (options) => {
    const {
      code,
      desc,
      value,
      defValue,
      multiline,
      multilineView,
      markdown,
    } = options

    return (
      <div className={styles.adminStorageTextArea}>
        <label>
          {desc} ({code}) {markdown && (<b>(MarkDown)</b>)} {multiline && (<b>(Multiline)</b>)}
        </label>
        {(multiline || multilineView) ? (
          <textarea
            value={newTexts[code] !== undefined ? newTexts[code] : defValue}
            onChange={(e) => { updateStorageText(code, e.target.value) }}
          ></textarea>
        ) : (
          <input
            type="text"
            value={newTexts[code] !== undefined ? newTexts[code] : defValue}
            onChange={(e) => { updateStorageText(code, e.target.value) }}
          />
        )}
      </div>
    )
  }

  const [ isGroupOpened, setIsGroupOpened ] = useState({})
  
  const [ isTextsSaving, setIsTextsSaving ] = useState(false)
  const doSaveTextGroup = (groupKey) => {
    const saveGroupData = {}
    const groupData = textsGroups.find((data) => {
      return data.key == groupKey
    })
    openConfirmWindow({
      title: `Saving changes`,
      message: `Save texts changes of section "${groupData.title}"?`,
      onConfirm: () => {
        groupData.items.forEach((itemData) => {
          if (newTexts[itemData.code] && itemData.value !== newTexts[itemData.code]) {
            saveGroupData[itemData.code] = newTexts[itemData.code]
          }
        })
        console.log(groupKey, groupData, saveGroupData)
        setIsTextsSaving(true)
        saveExStorageConfig({
          key: `texts_${groupKey}`,
          data: saveGroupData,
          onBegin: () => {
            addNotify(`Confirm transaction for save changes`)
          },
          onReady: () => {
            addNotify(`Changes successfull saved`, `success`)
            setIsTextsSaving(false)
          },
          onError: (err) => {
            addNotify(`Fail save changes`, `error`)
            setIsTextsSaving(false)
          }
        })
      }
    })
    
  }

  const onGroupToggle = (groupKey) => {
    setIsGroupOpened((prev) => {
      return {
        ...prev,
        [`${groupKey}`]: isGroupOpened[groupKey] !== undefined ? !isGroupOpened[groupKey] : true
      }
    })
  }
  return {
    render: () => {
      return (
        <div className={styles.adminForm}>
          <div className={styles.actionsRow}>
            {isPreviewMode ? (
              <>
                <button className={styles.adminButton} onClick={offPreviewDesign}>
                  Turn off preview mode
                </button>
              </>
            ) : (
              <button className={styles.adminButton} onClick={onPreviewDesign}>
                Turn on preview mode
              </button>
            )}
          </div>
          <br />
          {Object.keys(textsGroups).map((groupKey) => {
            return toggleGroup({
              title: textsGroups[groupKey].title,
              isOpened: isGroupOpened[textsGroups[groupKey].key],
              onToggle: () => { onGroupToggle(textsGroups[groupKey].key) },
              key: textsGroups[groupKey].key,
              content: (
                <>
                  <div className={styles.adminFormTextGroup}>
                    {textsGroups[groupKey].items.map((itemInfo, itemKey) => {
                      const {
                        code,
                        desc,
                        value,
                        multiline,
                        markdown,
                        multilineView,
                      } = itemInfo
                      return (
                        <div key={itemKey}>
                          {renderStorageTextArea({
                            code: code,
                            desc: desc,
                            defValue: value,
                            multiline,
                            multilineView,
                            markdown,
                          })}
                        </div>
                      )
                    })}
                  </div>
                  <div className={styles.actionsRow}>
                    <hr />
                    <SwitchNetworkAndCall
                      chainId={`STORAGE`}
                      className={styles.adminButton}
                      disabled={isTextsSaving}
                      onClick={() => { doSaveTextGroup(textsGroups[groupKey].key) }}
                      action={`Save section changes`}
                    >
                      {isTextsSaving ? `Saving texts changes` : `Save texts section changes`}
                    </SwitchNetworkAndCall>
                  </div>
                </>
              )
            })
          })}
          {/*
          <div className={styles.actionsRowMain}>
            {isPreviewMode ? (
              <>
                <button onClick={offPreviewDesign}>
                  Turn off preview mode
                </button>
              </>
            ) : (
              <button onClick={onPreviewDesign}>
                Turn on preview mode
              </button>
            )}
            <button disabled={isSaveTexts} onClick={doSaveTexts}>
              {isSaveTexts ? `Saving...` : `Save changes`}
            </button>
          </div>
          */}
        </div>
      )
    }
  }
}