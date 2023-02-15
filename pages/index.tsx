import type { NextPage } from "next"
import { useRouter } from "next/router"
import styles from "../styles/Home.module.css"
import { getLink, getAssets, getBoolOption, getIntOption } from "../helpers"
import navBlock from "../components/navBlock"
import logoBlock from "../components/logoBlock"
import useStorage from "../storage/"
import { useEffect, useState } from "react"


const Home: NextPage = (props) => {
  const router = useRouter();
  const { isOwner, getText, getDesign, storageMenu } = props

  return (
    <div className={styles.container}>
      {navBlock(`index`)}
      {/* Top Section */}
      {logoBlock({
        getText,
        getDesign
      })}
      <h1 className={`${styles.h1} pageTitle`}>{getText(`MainPage_VK_Header`, `VK NFT MP`)}</h1>

      <div className="mainPageTextAfterTitle">
        {getText(`MainPage_AfterTitle`)}
      </div>
      <div
        className={styles.nftBoxGrid}
      >
        {/* Mint a new NFT */}
        { getBoolOption( `EnabledDemoMind` , true ) && (
          <div className={`${styles.optionSelectBox} mainPageSection`}>
            <a href={getLink(`mintown`)}>
              <h2 className={styles.selectBoxTitle}>
                {getText(`MainOwnPage_Mint_Title`, `Mint NFT`)}
              </h2>
              <p className={styles.selectBoxDescription}>
                {getText(`MainOwnPage_Mint_Desc`, `Use the NFT Drop Contract to claim an NFT.`)}
              </p>
            </a>
          </div>
        )}
        <div
          className={`${styles.optionSelectBox} mainPageSection`}
          
        >
          <a href={getLink(`marketplace`)}>
            <h2 className={styles.selectBoxTitle}>
              {getText(`MainPage_Marketplace_Title`, `NFTs Marketplace`)}
            </h2>
            <p className={styles.selectBoxDescription}>
              {getText(
                `MainPage_Marketplace_Desc`,
                `Buy NFTs or sell yours`
              )}
            </p>
          </a>
        </div>
      </div>
      <div className="mainPageTextAfterSections">
        {getText(`MainPage_AfterSections`)}
      </div>
    </div>
  );
};

export default Home;
