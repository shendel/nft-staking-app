import styles from "/styles/Home.module.css"
import { useEffect, useState } from "react"
import FaIcon from "./FaIcon"
import iconButton from "./iconButton"
import { getAssets } from "/helpers/getAssets"

export default function AdminInfoRow(options) {
  const {
    label,
    value,
    canEdit,
    editView,
    onEdit,
    onSave,
    onCancel,
    injectedButtons
  } = {
    canEdit: false,
    injectedButtons: false,
    editView: () => { return null },
    onEdit: () => {},
    onSave: () => { return true },
    onCancel: () => {},
    ...options
  }

  const [ isEditState, setIsEditState ] = useState(false)
  const [ isSaving, setIsSaving ] = useState(false)
  const goToEditState = () => {
    setIsEditState(true)
    onEdit()
  }
  
  const doSave = async () => {
    setIsSaving(true)
    if (await onSave()) {
      setIsEditState(false)
    }
    setIsSaving(false)
  }

  const cancelEdit = () => {
    setIsEditState(false)
    onCancel()
  }

  const actionsButtons = (
    <>
      <a className={styles.buttonWithIcon} onClick={doSave}>
        <FaIcon icon="save" />
        {`Save changes`}
      </a>
      <a className={styles.buttonWithIcon} onClick={cancelEdit}>
        <FaIcon icon="cancel" />
        {`Cancel`}
      </a>
    </>
  )
  return (
    <>
      <style jsx>
        {`
          .actions {
            display: block;
            width: 100%;
            text-align: right;
            padding-top: 5px;
            
          }
          .valueHolder {
            position: relative;
          }
          .loadingBg {
            display: block;
            position: absolute;
            left: 0px;
            top: 0px;
            bottom: 0px;
            right: 0px;
            background: #1c1e21;
            opacity: 0.5;
          }
          .loadingImage {
            display: block;
            position: absolute;
            left: 0px;
            top: 0px;
            bottom: 0px;
            right: 0px;
            background: url(${getAssets('images/admin-loading.svg')});
            background-position: center;
            background-size: contain;
            background-repeat: no-repeat;
          }
        `}
      </style>
      <div className={styles.infoRow}>
        <label>{label}:</label>
        <div className="valueHolder">
          <div>
            {isEditState ? (
              <>
                {editView(actionsButtons)}
              </>
            ) : (
              <>
                {value}
                {canEdit && (
                  <>
                    {iconButton({
                      icon: `edit`,
                      title: `Edit value`,
                      onClick: () => { goToEditState() }
                    })}
                  </>
                )}
              </>
            )}
          </div>
          {isEditState && !injectedButtons && (
            <div>
              <div className="actions">
                {actionsButtons}
              </div>
            </div>
          )}
          {isSaving && (
            <>
              <em className="loadingBg"></em>
              <em className="loadingImage"></em>
            </>
          )}
        </div>
      </div>
    </>
  )
}