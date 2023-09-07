  const Web3ObjectToArray = (object) => {
    try {
      return Object.keys(object).map((key) => {
        return object[key]
      })
    } catch (err) { return [] }
  }
  export default Web3ObjectToArray