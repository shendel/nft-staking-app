  const Web3ObjectToArray = (object) => {
    return Object.keys(object).map((key) => {
      return object[key]
    })
  }
  export default Web3ObjectToArray