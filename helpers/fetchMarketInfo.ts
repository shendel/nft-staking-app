import MarketContractData from "../contracts/source/artifacts/Marketplace.json"
import Web3 from 'web3'
import MulticallAbi from '../contracts/MulticallAbi.json'

import { MULTICALL_CONTRACTS } from './constants'
import { Interface as AbiInterface } from '@ethersproject/abi'


import { CHAIN_INFO } from "./constants"

import { callMulticall } from './callMulticall'


const fetchMarketInfo = (options) => {
  const {
    address,
    chainId,
    offset,
    limit,
    onlyTokens,
    userAddress,
  } = {
    offset: 0,
    limit: 10,
    onlyTokens: false,
    userAddress: false,
    ...options
  }
  return new Promise((resolve, reject) => {
    const chainInfo = CHAIN_INFO(chainId)
    const MarketContractAbi = MarketContractData.abi
    if (chainInfo && chainInfo.rpcUrls) {
      try {
        const web3 = new Web3(chainInfo.rpcUrls[0])

        const multicall = new web3.eth.Contract(MulticallAbi, MULTICALL_CONTRACTS[chainId])
        const abiI = new AbiInterface(MarketContractAbi)
        callMulticall({
          multicall,
          target: address,
          encoder: abiI,
          calls: 
            (userAddress)
              ? {
                tokens: { func: 'getUserTokensAtSale', args: [ userAddress ] }
              } : (onlyTokens)
                ? {
                  tokensAtSaleCount:{ func: 'getTokensAtSaleCount' },
                  tokensAtSale:     { func: 'getTokensAtSale', args: [offset, limit] },
                } : {
                  isMPContract:     { func: 'isMarketPlaceContract' },
                  owner:            { func: 'owner' },
                  version:          { func: 'version' },
                  marketNft:        { func: 'marketNft' },
                  tradeFee:         { func: 'getTradeFee' },
                  tokensAtSaleCount:{ func: 'getTokensAtSaleCount' },
                  tokensAtSale:     { func: 'getTokensAtSale', args: [offset, limit] },
                  allowedERC20:     { func: 'getAllowedERC20' },
                  feeReceiver:      { func: 'getFeeReceiver' },
                }
        }).then((mcAnswer) => {
          console.log('>> market mc info', mcAnswer)
          resolve(mcAnswer)
        }).catch((err) => {
          console.log('>>> Fail fetch all info', err)
          reject(err)
        })
      } catch (err) {
        reject(err)
      }
    } else {
      reject(`NOT_SUPPORTED_CHAIN`)
    }
  })
}

export default fetchMarketInfo