
const processValue = (val) => {
  if (val && val._isBigNumber) val = val.toString()

  if (val instanceof Array) {
    const newVal = {}
    Object.keys(val).forEach((valKey) => {
      newVal[valKey] = val[valKey]
      if (val[valKey] && val[valKey]._isBigNumber) newVal[valKey] = val[valKey].toString()
      if (val[valKey] instanceof Array) {
        newVal[valKey] = processValue(val[valKey])
      }
    })
    return newVal
  }
  return val
}

export const callMulticall = (options) => {
  const {
    multicall,
    target,
    encoder,
    calls,
  } = options

  return new Promise((resolve, reject) => {
    const ret = {}
    const mcCallToValue = []
    const mcCalls = Object.keys(calls).map((targetKey) => {
      const {
        func,
        args
      } = calls[targetKey]
      mcCallToValue.push(targetKey)
      return {
        target,
        callData: encoder.encodeFunctionData(func, args)
      }
    })
    multicall.methods.tryAggregate(false, mcCalls).call().then((answers) => {
      answers.forEach((retData, index) => {
        if (retData.success) {
          let val = encoder.decodeFunctionResult(
            calls[mcCallToValue[index]].func,
            retData.returnData
          )[0]

          val = processValue(val)

          ret[mcCallToValue[index]] = val
        } else {
          ret[mcCallToValue[index]] = false
        }
      })
      resolve(ret)
    }).catch((err) => {
      reject(err)
    })
  })
}

export const callMulticallGroup = (options) => {
  const {
    multicall,
    calls,
  } = options

  return new Promise((resolve, reject) => {
    const ret = {}
    const mcCalls = calls.map((callData) => {
      const {
        group,
        func,
        args,
        encoder,
        target
      } = callData

      if (!ret[group]) ret[group] = {}
      return {
        target,
        callData: encoder.encodeFunctionData(func, args || [])
      }
    })
    multicall.methods.tryAggregate(false, mcCalls).call().then((answers) => {
    console.log(answers)
      answers.forEach((retData, index) => {
        if (retData.success) {
          let val = calls[index].encoder.decodeFunctionResult(
            calls[index].func,
            retData.returnData
          )[0]
          val = processValue(val)

          ret[calls[index].group][calls[index].value || calls[index].func] = val
        } else {
          ret[calls[index].group][calls[index].value || calls[index].func] = false
        }
      })
      resolve(ret)
    }).catch((err) => {
      reject(err)
    })
  })
}