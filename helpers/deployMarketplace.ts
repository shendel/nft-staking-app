import MpContractData from "../contracts/source/artifacts/Marketplace.json"
import { calcSendArgWithFee } from "./calcSendArgWithFee"
import { BigNumber } from 'bignumber.js'

const deployMarketplace = (options) => {
  return new Promise((resolve, reject) => {
    const {
      activeWeb3,
      nftCollection,
      tradeFee,
      feeReceiver,
      allowedERC20,
      onTrx,
      onSuccess,
      onError,
      onFinally,
    } = {
      onTrx: () => {},
      onSuccess: () => {},
      onError: () => {},
      onFinally: () => {},
      ...options
    }

    activeWeb3.eth.getAccounts().then(async (accounts) => {
      if (accounts.length>0) {
        const activeWallet = accounts[0]
        const mpContract = new activeWeb3.eth.Contract(MpContractData.abi)

        const txArguments = {
          from: activeWallet,
          gas: '0'
        }
/*
        address _nft,
        address __feeReceiver,
        uint __tradeFee,
        address[] memory __allowedERC20
*/
        const _arguments = [
          nftCollection,
          feeReceiver,
          tradeFee,
          allowedERC20
        ]

        const gasAmountCalculated = await mpContract.deploy({
          arguments: _arguments,
          data: MpContractData.data.bytecode.object
        }).estimateGas(txArguments)

        const gasPrice = await activeWeb3.eth.getGasPrice()
        txArguments.gasPrice = gasPrice

        const gasAmounWithPercentForSuccess = new BigNumber(
          new BigNumber(gasAmountCalculated)
            .multipliedBy(1.05) // + 5% -  множитель добавочного газа, если будет фейл транзакции - увеличит (1.05 +5%, 1.1 +10%)
            .toFixed(0)
        ).toString(16)

        txArguments.gas = '0x' + gasAmounWithPercentForSuccess

        mpContract.deploy({
          data: '0x' + MpContractData.data.bytecode.object,
          arguments: _arguments,
        })
          .send(txArguments)
          .on('transactionHash', (hash) => {
            console.log('transaction hash:', hash)
            onTrx(hash)
          })
          .on('error', (error) => {
            console.log('transaction error:', error)
            onError(error)
          })
          .on('receipt', (receipt) => {
            console.log('transaction receipt:', receipt)
            onSuccess(receipt.contractAddress)
          })
          .then(() => {
            onFinally()
          })
      } else {
        reject('NO_ACTIVE_ACCOUNT')
      }
    }).catch((err) => {
      console.log('>>> deployMarketplace', err)
      reject(err)
    })
  })
}

export default deployMarketplace