import styles from "../../styles/Home.module.css"
import { useEffect, useState } from "react"
import { useStateUri, useStateUint } from "../../helpers/useState"
import { defaultDesign } from "../../helpers/defaultDesign"
import { getUnixTimestamp } from "../../helpers/getUnixTimestamp"

import toggleGroup from "../toggleGroup"
import iconButton from "../iconButton"
import InputColor from 'react-input-color'

import SwitchNetworkAndCall from "../SwitchNetworkAndCall"

const useStateColor = useStateUri

const designGroups = [
  {
    title: 'Main settings',
    key: 'mainSettings',
    items: [
      { type: 'uri', title: 'Logo uri', target: 'logoUri' },
      { type: 'number', title: 'Logo max width', target: 'logoMaxWidth', unit: 'px' },
      { type: 'color', title: 'Background color', target: 'backgroundColor' },
      { type: 'uri', title: 'Background image', target: 'backgroundImage' },
      { type: 'color', title: 'Base text color', target: 'baseTextColor' },
      { type: 'color', title: 'Page title color', target: 'pageTitleColor' },
      { type: 'color', title: 'HR line color', target: 'hrColor' },
      { type: 'subgroup', title: 'Primary button' },
      { type: 'color', title: 'Background color #1', target: 'prButtonBg1' },
      { type: 'color', title: 'Background color #2', target: 'prButtonBg2' },
      { type: 'color', title: 'Text color', target: 'prButtonColor' },
      { type: 'color', title: 'Background (disabled)', target: 'prButtonDisabledBg' },
      { type: 'color', title: 'Text color (disabled)', target: 'prButtonDisabledColor' },
      { type: 'number', title: 'Border radius', target: 'prButtonBorderRadius', unit: 'px' },
    ]
  },
  {
    title: 'Header Navigate menu',
    key: 'headerNav',
    items: [
      { type: 'color', title: 'Background color', target: 'navMenuBgColor' },
      { type: 'color', title: 'Link color', target: 'navMenuColor' },
      { type: 'color', title: 'Link hover color', target: 'navMenuHoverColor' },
      { type: 'color', title: 'Active item color', target: 'navMenuActiveColor' },
      { type: 'color', title: 'Bottom line color', target: 'navMenuBottomLineColor' },
      { type: 'number', title: 'Bottom line size', target: 'navMenuBottomLineSize' },
    ]
  },
  {
    title: 'Footer',
    key: 'footer',
    items: [
      { type: 'color', title: 'Top line color', target: 'footerTopLineColor' },
      { type: 'number', title: 'Top line size', target: 'footerTopLineSize' },
      { type: 'color', title: 'Background color', target: 'footerBgColor' },
      { type: 'color', title: 'Text color', target: 'footerTextColor' },
      { type: 'color', title: 'Link color', target: 'footerLinkColor' },
      { type: 'color', title: 'Link color (hover)', target: 'footerLinkHoverColor' },
    ]
  },
  {
    title: 'Main page',
    key: 'mainPage',
    items: [
      { type: 'color', title: 'After title text color', target: 'mainPageTextAfterTitleColor' },
      { type: 'subgroup', title: 'Main page sections' },
      { type: 'color', title: 'Background color', target: 'mainPageSectionBackground' },
      { type: 'color', title: 'Border color', target: 'mainPageSectionBorderColor' },
      { type: 'color', title: 'Title color', target: 'mainPageSectionTitleColor' },
      { type: 'color', title: 'Descripton color', target: 'mainPageSectionDescColor' },
      { type: 'hr' },
      { type: 'color', title: 'After sections text color', target: 'mainPageTextAfterSectionsColor' },
    ],
  },
  {
    title: 'NFT Token design',
    key: 'nftToken',
    items: [
      { type: 'color', title: 'Background color', target: 'nftBackgroundColor' },
      { type: 'color', title: 'Border color', target: 'nftBorderColor' },
      { type: 'color', title: 'TokenId color', target: 'nftIdColor' },
      { type: 'number', title: 'Border radius', target: 'nftBorderRadius', unit: 'px' },
      { type: 'number', title: 'Border size', target: 'nftBorderSize', unit: 'px' },
      { type: 'number', title: 'Image max-height', target: 'nftMaxHeight', unit: 'px' },
    ],
  },
  {
    title: 'Mint page',
    key: 'mintPage', 
    items: [
      { type: 'subgroup', title: 'Connect wallet section' },
      { type: 'color', title: 'Color of text before connect wallet button', target: 'mintBeforeConnectColor' },
      { type: 'color', title: 'Color of text after connect wallet button', target: 'mintAfterConnectColor' },
      { type: 'subgroup', title: 'Main section' },
      { type: 'color', title: 'Color of subtitle "Mint NFT"', target: 'mintPageSubTitleColor' },
      { type: 'color', title: 'Color of text before price', target: 'mintPageBeforePriceColor' },
      { type: 'color', title: 'Color of mint price', target: 'mintPagePriceColor' },
      { type: 'color', title: 'Color of text after price', target: 'mintPageAfterPriceColor' },
    ],
  },
  {
    title: 'Stake page',
    key: 'stakePage',
    items: [
      { type: 'subgroup', title: 'Connect wallet section' },
      { type: 'color', title: 'Color of text before connect wallet button', target: 'stakeBeforeConnectColor' },
      { type: 'color', title: 'Color of text after connect wallet button', target: 'stakeAfterConnectColor' },
      { type: 'color', title: 'Connected wallet label color', target: 'stakeConnectWalletColor' },
      { type: 'subgroup', title: 'Reward section and bank section' },
      { type: 'color', title: 'Color of text before label', target: 'stakeBeforeYourRewardColor' },
      { type: 'color', title: '"Your reward" label color', target: 'stakeYourRewardColor' },
      { type: 'color', title: 'Color of text after label', target: 'stakeAfterYourRewardColor' },
      { type: 'hr' },
      { type: 'color', title: 'Background color', target: 'stakeRewardBackground' },
      { type: 'color', title: 'Title color', target: 'stakeRewardTitleColor' },
      { type: 'color', title: 'Amount color', target: 'stakeRewardAmountColor' },
      { type: 'color', title: 'Border color', target: 'stakeRewardBorderColor' },
      { type: 'number', title: 'Border size', target: 'stakeRewardBorderSize', unit: 'px' },
      { type: 'number', title: 'Border radius', target: 'stakeRewardBorderRadius', unit: 'px' },
      { type: 'subgroup', title: 'Stake and unstake section' },
      { type: 'color', title: '"Your staked NFTs" color', target: 'stakeYourStakedColor' },
      { type: 'color', title: 'Color of text after "Your staked NFTs"', target: 'stakeYourStakedDescColor' },
      { type: 'color', title: '"Your Unstaked NFTs" color', target: 'stakeYourUnstakedColor' },
      { type: 'color', title: 'Color of text after "Your Unstaked NFTs"', target: 'stakeYourUnstakedDescColor' },
    ],
  },
]

export default function TabDesign(options) {
  const {
    setDoReloadStorage,
    saveStorageConfig,
    openConfirmWindow,
    addNotify,
    getActiveChain,
    saveExStorageConfig,
    storageDesign,
  } = options

  const _lsPreviewMode = localStorage.getItem(`-nft-stake-preview-mode`)
  let _lsPreviewDesign = localStorage.getItem(`-nft-stake-preview-design`)
  try {
    _lsPreviewDesign = JSON.parse(_lsPreviewDesign)
    _lsPreviewDesign = {
      ...defaultDesign,
      ..._lsPreviewDesign,
    }
  } catch (e) {
    _lsPreviewDesign = defaultDesign
  }

  const [ isPreviewMode, setIsPreviewMode ] = useState(_lsPreviewMode !== null)

  const initialDesign = {
    ...defaultDesign,
    ...storageDesign,
  }

  const [ designValues, setDesignValues ] = useState(_lsPreviewMode ? _lsPreviewDesign : initialDesign)
  const [ isSaveDesign, setIsSaveDesign ] = useState(false)


  const renderColor = (options) => {
    const {
      title,
      target,
    } = options

    const onChange = (newColor) => {
      setDesignValues((prevValue) => {
        return {
          ...prevValue,
          [`${target}`]: newColor.hex,
        }
      })
    }

    return (
      <div className={styles.infoRow}>
        <label>{title}:</label>
        <span>
          <div>
            <InputColor
              initialValue={designValues[target]}
              onChange={onChange}
              placement="right"
            />
          </div>
        </span>
      </div>
    )
  }

  const renderUri = (options) => {
    const {
      title,
      target,
      placeholder,
    } = options

    const onChange = (value) => {
      setDesignValues((prevValue) => {
        return {
          ...prevValue,
          [`${target}`]: value,
        }
      })
    }
    
    return (
      <div className={styles.infoRow}>
        <label>{title}:</label>
        <span>
          <div>
            <input
              placeholder={placeholder}
              type="text" value={designValues[target]} onChange={(e) => { onChange(e.target.value) }}
            />
            {iconButton({
              title: `Open in new tab`,
              href: designValues[target],
              target: `_blank`
            })}
          </div>
        </span>
      </div>
    )
  }

  const renderNumber = (options) => {
    const {
      title,
      target,
      unit,
    } = options

    const onChange = (value) => {
      setDesignValues((prevValue) => {
        return {
          ...prevValue,
          [`${target}`]: value,
        }
      })
    }
    
    return (
      <div className={styles.infoRow}>
        <label>{title}:</label>
        <span>
          <div>
            <input
              type="number" value={designValues[target]} onChange={(e) => { onChange(e.target.value) }}
            />
            <strong>{unit}</strong>
          </div>
        </span>
      </div>
    )
  }

  const onPreviewDesign = () => {
    openConfirmWindow({
      title: `Switch to preview mode`,
      message: `Switch to preview mode? You can look changes before save`,
      onConfirm: () => {
        addNotify(`Preview mode on. Go to site for check it`, `success`)
        localStorage.setItem(`-nft-stake-preview-mode`, true)
        localStorage.setItem(`-nft-stake-preview-design`, JSON.stringify(designValues))
        setIsPreviewMode(true)
      }
    })
  }

  const offPreviewDesign = () => {
    addNotify(`Preview mode turn off`, `success`)
    localStorage.removeItem(`-nft-stake-preview-mode`)
    localStorage.removeItem(`-nft-stake-preview-design`)
    setIsPreviewMode(false)
  }
  useEffect(() => {
    if (isPreviewMode) {
      localStorage.setItem(`-nft-stake-preview-design`, JSON.stringify(designValues))
      localStorage.setItem(`-nft-stake-preview-utx`, getUnixTimestamp())
    }
  }, [designValues])

  const [ isDesignSaving, setIsDesignSaving ] = useState(false)
  const doSaveDesignSection = (groupKey) => {
    if (isDesignSaving) return
    const designSection = designGroups.find((groupInfo) => {
      return groupInfo.key == groupKey
    })
    openConfirmWindow({
      title: `Saving changes`,
      message: `Save design changes of section "${designSection.title}"?`,
      onConfirm: () => {
        const designGroupData = {}
        designSection.items.forEach((itemData) => {
          if (`${designValues[itemData.target]}`.toLowerCase() != `${defaultDesign[itemData.target]}`.toLowerCase()) {
            designGroupData[itemData.target] = designValues[itemData.target]
          }
        })

        setIsDesignSaving(true)
        saveExStorageConfig({
          key: `design_${groupKey}`,
          data: designGroupData,
          onBegin: () => {
            addNotify(`Confirm transaction for save changes`)
          },
          onReady: () => {
            addNotify(`Changes successfull saved`, `success`)
            setIsDesignSaving(false)
          },
          onError: (err) => {
            addNotify(`Fail save changes`, `error`)
            setIsDesignSaving(false)
          }
        })
      }
    })
  }
  
  const doSaveDesign = () => {
    const newDesign = designValues
    const newConfig = {
      design: newDesign
    }
    saveExStorageConfig({
      onBegin: () => {
        addNotify(`Confirm transaction for save changed texts`)
      },
      onReady: () => {
        addNotify(`Texts successfull saved`, `success`)
      },
      onError: (err) => {
        addNotify(`Fail save texts`, `error`)
      },
      key: `design`,
      data: newConfig
    })
  }

  const [ openedTabs, setOpenedTabs ] = useState({})

  const toggleTab = (tab) => {
    setOpenedTabs((prev) => {
      return {
        ...prev,
        [`${tab}`]: (prev[tab]) ? !prev[tab] : true,
      }
    })
  }

  
  return {
    render: () => {
      return (
        <div className={styles.adminForm}>
          <div className={styles.subFormInfo}>
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
            {designGroups.map((groupInfo) => {
              return toggleGroup({
                key: groupInfo.key,
                title: groupInfo.title,
                isOpened: openedTabs[groupInfo.key],
                onToggle: () => { toggleTab(groupInfo.key) },
                content: (
                  <>
                    {groupInfo.items.map((itemData, itemKey) => {
                      switch (itemData.type) {
                        case 'uri':
                          return (
                            <div key={itemKey}>
                              {renderUri(itemData)}
                            </div>
                          )
                        case 'color':
                          return (
                            <div key={itemKey}>
                              {renderColor(itemData)}
                            </div>
                          )
                        case 'number':
                          return (
                            <div key={itemKey}>
                              {renderNumber(itemData)}
                            </div>
                          )
                        case 'hr':
                          return (
                            <div key={itemKey}>
                              <hr />
                            </div>
                          )
                        case 'subgroup':
                          return (
                            <div key={itemKey}>
                              <h5>{itemData.title}</h5>
                            </div>
                          )
                        default:
                          return (
                            <div key={itemKey}>Unknown {itemData.type}</div>
                          )
                      }
                    })}
                    <div className={styles.actionsRow}>
                      <hr />
                      <SwitchNetworkAndCall
                        chainId={`STORAGE`}
                        className={styles.adminButton}
                        disabled={isDesignSaving}
                        onClick={() => { doSaveDesignSection(groupInfo.key) }}
                        action={`Save section changes`}
                      >
                        {isDesignSaving ? `Saving design changes` : `Save design section changes`}
                      </SwitchNetworkAndCall>
                    </div>
                  </>
                )
              })
            })}
          </div>
        </div>
      )
    },
    render2: () => {
      return (
        <div className={styles.adminForm}>
          <div className={styles.subFormInfo}>
            
            {toggleGroup({
              title: 'Footer',
              isOpened: openedTabs?.footer,
              onToggle: () => { toggleTab('footer') },
              content: (
                <>
                  {renderColor({ title: 'Top line color', target: 'footerTopLineColor' })}
                  {renderNumber({ title: 'Top line size', target: 'footerTopLineSize' })}
                  {renderColor({ title: 'Background color', target: 'footerBgColor' })}
                  {renderColor({ title: 'Text color', target: 'footerTextColor' })}
                  {renderColor({ title: 'Link color', target: 'footerLinkColor' })}
                  {renderColor({ title: 'Link color (hover)', target: 'footerLinkHoverColor' })}
                </>
              )
            })}
            {toggleGroup({
              title: 'Main page',
              isOpened: openedTabs?.mainPage,
              onToggle: () => { toggleTab('mainPage') },
              content: (
                <>
                  {renderColor({ title: 'After title text color', target: 'mainPageTextAfterTitleColor' })}
                  <h5>Main page sections</h5>
                  {renderColor({ title: 'Background color', target: 'mainPageSectionBackground' })}
                  {renderColor({ title: 'Border color', target: 'mainPageSectionBorderColor' })}
                  {renderColor({ title: 'Title color', target: 'mainPageSectionTitleColor' })}
                  {renderColor({ title: 'Descripton color', target: 'mainPageSectionDescColor' })}
                  <hr />
                  {renderColor({ title: 'After sections text color', target: 'mainPageTextAfterSectionsColor' })}
                </>
              )
            })}
            {toggleGroup({
              title: 'NFT Token design',
              isOpened: openedTabs?.nftToken,
              onToggle: () => { toggleTab('nftToken') },
              content: (
                <>
                  {renderColor({ title: 'Background color', target: 'nftBackgroundColor' })}
                  {renderColor({ title: 'Border color', target: 'nftBorderColor' })}
                  {renderColor({ title: 'TokenId color', target: 'nftIdColor' })}
                  {renderNumber({ title: 'Border radius', target: 'nftBorderRadius', unit: 'px' })}
                  {renderNumber({ title: 'Border size', target: 'nftBorderSize', unit: 'px' })}
                  {renderNumber({ title: 'Image max-height', target: 'nftMaxHeight', unit: 'px' })}
                </>
              )
            })}
            {toggleGroup({
              title: 'Mint page',
              isOpened: openedTabs?.mintPage,
              onToggle: () => { toggleTab('mintPage') },
              content: (
                <>
                  <h5>Connect wallet section</h5>
                  {renderColor({ title: 'Color of text before connect wallet button', target: 'mintBeforeConnectColor'})}
                  {renderColor({ title: 'Color of text after connect wallet button', target: 'mintAfterConnectColor'})}
                  <h5>Main section</h5>
                  {renderColor({ title: 'Color of subtitle "Mint NFT"', target: 'mintPageSubTitleColor'})}
                  {renderColor({ title: 'Color of text before price', target: 'mintPageBeforePriceColor' })}
                  {renderColor({ title: 'Color of mint price', target: 'mintPagePriceColor'})}
                  {renderColor({ title: 'Color of text after price', target: 'mintPageAfterPriceColor' })}
                </>
              )
            })}
            {toggleGroup({
              title: 'Stake page',
              isOpened: openedTabs?.stakePage,
              onToggle: () => { toggleTab('stakePage') },
              content: (
                <>
                  <h5>Connect wallet section</h5>
                  {renderColor({ title: 'Color of text before connect wallet button', target: 'stakeBeforeConnectColor'})}
                  {renderColor({ title: 'Color of text after connect wallet button', target: 'stakeAfterConnectColor'})}
                  {renderColor({ title: 'Connected wallet label color', target: 'stakeConnectWalletColor' })}
                  <h5>Reward section and bank section</h5>
                  {renderColor({ title: 'Color of text before label', target: 'stakeBeforeYourRewardColor' })}
                  {renderColor({ title: '"Your reward" label color', target: 'stakeYourRewardColor' })}
                  {renderColor({ title: 'Color of text after label', target: 'stakeAfterYourRewardColor' })}
                  <hr />
                  {renderColor({ title: 'Background color', target: 'stakeRewardBackground' })}
                  {renderColor({ title: 'Title color', target: 'stakeRewardTitleColor' })}
                  {renderColor({ title: 'Amount color', target: 'stakeRewardAmountColor' })}
                  {renderColor({ title: 'Border color', target: 'stakeRewardBorderColor' })}
                  {renderNumber({ title: 'Border size', target: 'stakeRewardBorderSize', unit: 'px'})}
                  {renderNumber({ title: 'Border radius', target: 'stakeRewardBorderRadius', unit: 'px'})}
                  <h5>Stake and unstake section</h5>
                  {renderColor({ title: '"Your staked NFTs" color', target: 'stakeYourStakedColor' })}
                  {renderColor({ title: 'Color of text after "Your staked NFTs"', target: 'stakeYourStakedDescColor' })}
                  {renderColor({ title: '"Your Unstaked NFTs" color', target: 'stakeYourUnstakedColor' })}
                  {renderColor({ title: 'Color of text after "Your Unstaked NFTs"', target: 'stakeYourUnstakedDescColor' })}
                </>
              )
            })}
            
            
            <div className={styles.actionsRow}>
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
              <button onClick={doSaveDesign}>
                Save changes
              </button>
            </div>
          </div>
        </div>
      )
    }
  }
}