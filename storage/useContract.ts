import { useMemo } from 'react'
import Web3 from 'web3'
import STORAGE from '../contracts/Storage.json'
import EX_STORAGE from "../contracts/source/artifacts/ExStorage.json"
import { getStorageInfo } from "./"

export function useStorageContract(): Contract | null {
  try {
    const {
      storageRpc,
      storageAddress,
    } = getStorageInfo()
    const web3 = new Web3(storageRpc)

    return new web3.eth.Contract(STORAGE.abi, storageAddress)
  } catch (error) {
    console.error('Failed to get Storage contract', error)
  }

  return null

}

export function useExStorageContract(): Contract | null {
  try {
    const {
      storageRpc,
      exStorageAddress,
    } = getStorageInfo()
    const web3 = new Web3(storageRpc)

    return new web3.eth.Contract(EX_STORAGE.abi, exStorageAddress)
  } catch (error) {
    console.error('Failed to get ExStorage contract', error)
  }

  return null
}