import type { NextPage } from "next"
import { useEffect, useState } from "react"

import useStorage from "../storage"

import MintDemo from "./mint_demo.tsx"
import MintOwn from "./mint_own.tsx"
import MintRand from "./mint_rand.tsx"

const Mint: NextPage = (props) => {

  return (
    <div>
      <MintDemo {...props} />
    </div>
  );
};

export default Mint;
