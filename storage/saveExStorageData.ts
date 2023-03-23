import { getStorageInfo } from "./"
import { getCurrentDomain } from "../helpers/getCurrentDomain"
import { calcSendArgWithFee} from "../helpers/calcSendArgWithFee"
import EX_STORAGE from "../contracts/source/artifacts/ExStorage.json"

const saveExStorageData = (options) => {
  return new Promise((resolve, reject) => {
    const {
      activeWeb3,
      onBegin,
      onReady,
      onError,
      key,
      data,
    } = options
    
    const {
      storageRpc,
      exStorageAddress,
    } = getStorageInfo()

    activeWeb3.eth.getAccounts().then(async (accounts) => {
      const address = accounts[0]
      const contract = new activeWeb3.eth.Contract(EX_STORAGE.abi, exStorageAddress)
      
      try {
        const setupTxData = await calcSendArgWithFee(
          address,
          contract,
          "setScopeKeyData",
          [
            getCurrentDomain(),
            key,
            JSON.stringify(data)
          ]
        )
        
        contract.methods.setScopeKeyData(
          getCurrentDomain(),
          key,
          JSON.stringify(data)
        ).send(setupTxData).then(() => {
          if (onReady) onReady()
        }).catch((err) => {
          console.log('>>> error', err)
          if (onError) onError(err)
        })
      } catch (err) {
        console.log('>>> error', err)
        if (onError) onError(err)
      }
    }).catch((err) => {
      console.log('>>> saveExStorageData', err)
      onError(err)
    })
  })
}

export default saveExStorageData