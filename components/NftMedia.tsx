import { useEffect, useState } from 'react'
import  fetch from "node-fetch"
import { ipfsUrl } from "../helpers/ipfsUrl"
import { getAssets } from "../helpers/getAssets"

export default function NftMedia(options) {
  const {
    url,
  } = options

  const [ isFetched, setIsFetched ] = useState(false)
  const [ isFetching, setIsFetching ] = useState(true)
  const [ isImageUrl, setIsImageUrl ] = useState(false)
  const [ isError, setIsError ] = useState(false)
  const [ jsonData, setJsonData ] = useState({})
  
  useState(() => {
    if (url) {
      fetch(ipfsUrl(url))
        .then((res) => {
          const contentType = res.headers.get('content-type')
          if (contentType.startsWith(`image/`)) {
            return `IMAGE`
          }
          return res.text()
        })
        .then((text) => {
          if (text == `IMAGE`) return `IMAGE`
          try {
            // UTF-8 BOM
            return JSON.parse(text.slice(1))
          } catch (e) {
            try {
              return JSON.parse(text)
            } catch (e) {
              return `FAIL_PARSE`
            }
          }
        })
        .then((json) => {
          setIsFetched(true)
          setIsFetching(false)
          if (json !== `FAIL_PARSE` && json !== `IMAGE`) {
         
            setJsonData(json)
          } else {
            if (json === `IMAGE`) {
              setIsImageUrl(true)
            } else {
              setIsError(true)
            }
          }
        })
        .catch((err) => {
          console.log('fail fetch', err)
        })
    }
  }, [url])

  const [ isLoadedMedia, setIsLoadedMedia ] = useState(false)
  const onLoaded = () => {
    setIsLoadedMedia(true)
  }

  return (
    <>
      <style jsx>
      {
        `
          .nftMedia IMG {
            opacity: 0;
            transition: opacity 0.3s linear;
          }
          .nftMedia.isLoaded IMG {
            opacity: 1;
          }
          .nftMedia {
            background: url(${getAssets('images/nft-media-loading.svg')});
            background-position: center;
            background-size: contain;
            background-repeat: no-repeat;
          }
          .nftMedia.isLoaded {
            background: none;
          }
        `
      }
      </style>
      <div className={`nftMedia ${(isLoadedMedia) ? 'isLoaded' : ''}`} >
        {isFetching ? (
          <div>{`Fetching`}</div>
        ) : (
          <>
            {isFetched && (
              <>
                {jsonData && jsonData.image && (
                  <>
                    <img src={ipfsUrl(jsonData.image)} onLoad={onLoaded} loading="lazy" />
                    {/*<img src={getAssets('images/nft-media-loading.svg')} />*/}
                  </>
                )}
                {isImageUrl && (
                  <img src={ipfsUrl(url)} onLoad={onLoaded} loading="lazy" />
                )}
                {jsonData && jsonData.name && (
                  <strong>{jsonData.name}</strong>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}