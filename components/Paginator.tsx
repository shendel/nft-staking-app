import { useEffect, useState } from "react"


export default function Paginator(options) {
  const {
    page,
    perPage,
    itemsCount,
    onNavigate
  } = options
  
  const countOfPages = itemsCount < perPage ? 1 : Math.ceil(itemsCount / perPage)

  if (countOfPages == 1) return null

  const renderFor = (start, end, step, render) => {
    const ret = []
    for (let i = start; i < end; i = i + step) {
      ret.push(render(i))
    }
    return ret
  }
  return (
    <>
      <style jsx>
        {`
          NAV {
            display: block;
            outline: 1px solid red;
          }
          NAV A {
            display: inline-block;
            color: #FFF;
            padding: 10px;
            cursor: pointer;
          }
          NAV A.active {
            outline: 1px solid blue;
          }
        `}
      </style>
      <nav>
        {renderFor(0, countOfPages, 1, (i) => {
          return (
            <a className={(i == page) ? `active` : ``} onClick={() => { onNavigate(i) }}>{i+1}</a>
          )
        })}
      </nav>
    </>
  )
}