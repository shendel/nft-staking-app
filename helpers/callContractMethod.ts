import NftContractData from "../contracts/source/artifacts/StakeNFT.json"
import Web3 from 'web3'
import { calcSendArgWithFee } from "./calcSendArgWithFee"
import { BigNumber } from 'bignumber.js'

const callContractMethod = (options) => {
  return new Promise((resolve, reject) => {
    const {
      activeWeb3,
      contract,
      method,
      args,
      weiAmount
    } = options
    const onTrx = options.onTrx || (() => {})
    const onSuccess = options.onSuccess || (() => {})
    const onError = options.onError || (() => {})
    const onFinally = options.onFinally || (() => {})

    activeWeb3.eth.getAccounts().then(async (accounts) => {
      if (accounts.length>0) {
        const activeWallet = accounts[0]

        console.log('>> amount', weiAmount)
        const sendArgs = await calcSendArgWithFee(
          activeWallet,
          contract,
          method,
          args || [],
          weiAmount
        )
        const gasPrice = await activeWeb3.eth.getGasPrice()
        sendArgs.gasPrice = gasPrice
        console.log('>> amount 2', weiAmount, sendArgs)

        let txHash
        contract.methods[method](...(args || []))
          .send(sendArgs)
          .on('transactionHash', (hash) => {
            console.log('transaction hash:', hash)
            txHash = hash
            onTrx(hash)
          })
          .on('error', (error) => {
            console.log('transaction error:', error)
            onError(error)
            reject(error)
          })
          .on('receipt', (receipt) => {
            console.log('transaction receipt:', receipt)
            onSuccess(receipt)
          })
          .then((res) => {
            resolve(res)
            onFinally(res)
          }).catch((err) => {
            if(err.message.includes('not mined within 50 blocks')) {
              const handle = setInterval(() => {
                activeWeb3.eth.getTransactionReceipt(txHash).then((resp) => {
                  // @to-do - process logs
                  if(resp != null && resp.blockNumber > 0) {
                    clearInterval(handle)
                    resolve(resp)
                    onSuccess(resp)
                  }
                })
              }, 1000)
            } else {
              onError(err)
              reject(err)
            }
          })
      } else {
        reject('NO_ACTIVE_ACCOUNT')
      }
    }).catch((err) => {
      console.log('>>> callContractMethod', err)
      reject(err)
    })
  })
        
}


export default callContractMethod