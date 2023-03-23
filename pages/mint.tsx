import type { NextPage } from "next"
import { useEffect, useState } from "react"

import useStorage from "../storage"

import MintDemo from "./mint_demo.tsx"
import MintOwn from "./mint_own.tsx"
import Mint721r from "./mint_721r.tsx"

const Mint: NextPage = (props) => {
  const {
    storageData: {
      mintType,
    },
  } = props
  return (
    <>
      {mintType == `DEMO` && (<MintDemo {...props} />)}
      {mintType == `NFTMARKETPLACE` && (<MintDemo {...props} />)}
      {mintType == `ERC721R` && (<Mint721r {...props} />)}
    </>
  );
};

export default Mint;
