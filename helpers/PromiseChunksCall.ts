const PromiseChunksCall = (options) => {
  const {
    args,
    chunkSize,
    func
  } = {
    chunkSize: 100,
    ...options
  }
  

  return new Promise(async (resolve, reject) => {
    let ret = []
    for (let i = 0; i < args.length; i += chunkSize) {
      try {
        
        const chunk = args.slice(i, i + chunkSize);

        const chunkResult = await func(chunk)
        ret = [
          ...ret,
          ...chunkResult
        ]
      } catch (err) {
        reject(err)
      }
    }
    resolve(ret)
  })
}

export default PromiseChunksCall