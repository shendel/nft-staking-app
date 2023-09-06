import Web3 from 'web3'
import MulticallAbi from '../contracts/MulticallAbi.json'

import { MULTICALL_CONTRACTS } from './constants'
import { Interface as AbiInterface } from '@ethersproject/abi'

import NFT_ABI from '../contracts/ERC721Abi.json'

import { CHAIN_INFO } from "./constants"

import { callMulticall } from './callMulticall'

const fetchNftContent = (options) => {
  const {
    address,
    chainId,
    ids,
  } = options
  return new Promise((resolve, reject) => {
    const chainInfo = CHAIN_INFO(chainId)
    if (chainInfo && chainInfo.rpcUrls) {
      try {
        const web3 = new Web3(chainInfo.rpcUrls[0])

        const multicall = new web3.eth.Contract(MulticallAbi, MULTICALL_CONTRACTS[chainId])
        const abiI = new AbiInterface(NFT_ABI)
        const mcCalls = {}
        ids.forEach((tokenId) => {
          mcCalls[tokenId] = { func: 'tokenURI', args: [tokenId] }
        })
        callMulticall({
          multicall,
          target: address,
          encoder: abiI,
          calls: mcCalls
        }).then((mcAnswer) => {
          resolve(mcAnswer)
        }).catch((err) => {
          console.log('>>> Fail fetch all info', err)
          reject(err)
        })
      } catch (err) {
        console.log('>>> err', err)
        reject(err)
      }
    } else {
      reject(`NOT_SUPPORTED_CHAIN`)
    }
  })
}

export default fetchNftContent