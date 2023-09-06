import styles from "../styles/Home.module.css"

export default function adminFormRow(options) {
  const {
    type,
    label,
    value,
    onChange,
    buttons,
    values,
    placeholder,
    hasError,
    errorText,
    beforeDesc,
    afterDesc,
    subForm
  } = {
    ...options
  }

  let inputType = type
  switch (type) {
    case `address`:
      inputType = `text`
      break
  }

  return (
    <div className={`${(subForm) ? styles.infoRow : styles.adminFormInputHolder} ${(hasError) ? styles.hasError : ''}`}>
      {type === 'list' ? (
        <>
          <label>{label}: ({value})</label>
          <div>
            {hasError && errorText && (
              <span className={styles.hasError}>{errorText}</span>
            )}
            {beforeDesc && (<span className={styles.adminFormBeforeDesc}>{beforeDesc}</span>)}
            <select value={value} onChange={(v) => onChange(v.target.value)}>
              {values.map((item) => {
                return (
                  <option value={item.id} key={item.id}>{item.title}</option>
                )
              })}
            </select>
            {afterDesc && (<span className={styles.adminFormAfterDesc}>{afterDesc}</span>)}
          </div>
        </>
      ) : (
        <>
          <label>{label}:</label>
          
          {hasError && errorText && (
            <span className={styles.hasError}>{errorText}</span>
          )}
          <div>
            {beforeDesc && (<span className={styles.adminFormBeforeDesc}>{beforeDesc}</span>)}
            <input type={inputType} placeholder={placeholder || ``} value={value} onChange={(v) => onChange(v.target.value)} />
            {afterDesc && (<span className={styles.adminFormAfterDesc}>{afterDesc}</span>)}
          </div>
        </>
      )}
      {buttons && (
        <div className={styles.adminFormButtonsHolder}>{buttons}</div>
      )}
    </div>
  )
}