export function getCurrentDomain() {
  //return 'trendstake.com'
  //return 'shendel.github.io'
  return window.location.hostname || document.location.host || ''
}