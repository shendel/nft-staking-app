const DOMAINS_REMAP = {
  'shendel.github.io': 'vkmp.localhost'
}
export function getCurrentDomain() {
  //return 'shendel.github.io'
  const ret = window.location.hostname || document.location.host || ''
  if (DOMAINS_REMAP[ret]) return DOMAINS_REMAP[ret]
  return ret
}