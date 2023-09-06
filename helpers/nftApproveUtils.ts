import NFTAbi from "../contracts/ERC721Abi.json"
import Web3 from 'web3'
import { calcSendArgWithFee } from "./calcSendArgWithFee"
import { BigNumber } from 'bignumber.js'


export const NftIsApproved = (options) => {
  const {
    activeWeb3,
    nftAddress,
    operatorAddress,
  } = options
  console.log('>>> options', options)
  return new Promise((resolve, reject) => {
    activeWeb3.eth.getAccounts().then(async (accounts) => {
      if (accounts.length>0) {
        const ownerAddress = accounts[0]
        const nftContract = new activeWeb3.eth.Contract(NFTAbi, nftAddress)
        
        nftContract.methods.isApprovedForAll(ownerAddress, operatorAddress).call()
          .then((approved) => {
            resolve(approved)
          })
          .catch((err) => {
            reject(err)
          })
      } else {
        reject('NO_ACTIVE_ACCOUNT')
      }
    }).catch((err) => {
      console.log('>>> NftIsApproved', err)
      reject(err)
    })
  })
}

export const NftSetApprove = (options) => {
  const {
    activeWeb3,
    nftAddress,
    operatorAddress,
    onTrx,
    onSuccess,
    onError,
    onFinally,
    isAllow
  } = {
    onTrx: () => {},
    onSuccess: () => {},
    onError: () => {},
    onFinally: () => {},
    isAllow: true,
    ...options
  }
  return new Promise((resolve, reject) => {
    activeWeb3.eth.getAccounts().then(async (accounts) => {
      if (accounts.length>0) {
        const ownerAddress = accounts[0]
        const nftContract = new activeWeb3.eth.Contract(NFTAbi, nftAddress)
        
        const sendArgs = await calcSendArgWithFee(
          ownerAddress,
          nftContract,
          'setApprovalForAll',
          [ operatorAddress, isAllow ],
          0
        )
        const gasPrice = await activeWeb3.eth.getGasPrice()
        sendArgs.gasPrice = gasPrice

        nftContract.methods.setApprovalForAll(operatorAddress, isAllow)
          .send(sendArgs)
          .on('transactionHash', (hash) => {
            console.log('transaction hash:', hash)
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
          })
      } else {
        reject('NO_ACTIVE_ACCOUNT')
      }
    }).catch((err) => {
      console.log('>>> NftSetApprove', err)
      reject(err)
    })
  })
}
/*
const approveToken = (options) => {
  return new Promise((resolve, reject) => {
    const {
      activeWeb3,
      chainId,
      tokenAddress,
      approveFor,
      weiAmount
    } = options

    const onTrx = options.onTrx || (() => {})
    const onSuccess = options.onSuccess || (() => {})
    const onError = options.onError || (() => {})
    const onFinally = options.onFinally || (() => {})

    activeWeb3.eth.getAccounts().then(async (accounts) => {
      if (accounts.length>0) {
        const activeWallet = accounts[0]
        const contract = new activeWeb3.eth.Contract(TokenAbi, tokenAddress)

        const sendArgs = await calcSendArgWithFee(
          activeWallet,
          contract,
          'approve',
          [ approveFor, weiAmount ]
        )

        contract.methods['approve'](...([ approveFor, weiAmount ]))
          .send(sendArgs)
          .on('transactionHash', (hash) => {
            console.log('transaction hash:', hash)
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
          })
      } else {
        reject('NO_ACTIVE_ACCOUNT')
      }
    }).catch((err) => {
      console.log('>>> approveToken', err)
      reject(err)
    })
  })
        
}


export default approveToken
*/
