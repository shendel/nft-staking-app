import styles from "../styles/Home.module.css"

export default function ListView(options) {
  const {
    labelEmpty,
    items,
  } = {
    
    ...options
  }

  return (
    <>
      <style jsx>
      {`
        .adminList {
          width: 100%;
        }
        .adminList UL {
          display: block;
          padding: 0px;
          list-style: none;
          margin: 0px;
        }
        .adminList UL LI {
          display: flex;
        }
        .adminList .empty {
          font-weight: bold;
          padding: 5px;
          text-align: center;
          border: 1px solid #FFF;
        }
      `}
      </style>
      <div className="adminList">
        {items.length > 0 ? (
          <ul>
            {items.map((item, itemIndex) => {
              return (
                <li key={itemIndex}>
                  {items[itemIndex]}
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="empty">{labelEmpty ? labelEmpty : `List is empty`}</div>
        )}
      </div>
    </>
  )
}