import { IconButton } from "~/components/IconButton"
import styles from "./styles.module.css"
import { Icon } from "~/components/Icon"
import formatRelativeDate from "~/utils/formatRelativeDate"
import now from "~/utils/now"
import type { ChangeEvent } from "react"

type AlbumInfoProps = {
  album: { name: string, startDate: string, endDate: string }
  isEditable?: boolean
  onEditDateRangeButtonClick: VoidFunction
  onAlbumNameChange: (newName: string) => void
}

export function AlbumInfo({ album, isEditable, onEditDateRangeButtonClick, onAlbumNameChange }: AlbumInfoProps) {
  const { name, startDate, endDate } = album
  const formattedStartDate = startDate !== "" ? formatRelativeDate(startDate, now) : "-- / --"
  const formattedEndDate = endDate !== ""? formatRelativeDate(endDate, startDate, { minimumUnit: "day" }) : "-- / --"

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onAlbumNameChange(e.currentTarget.value)
  }

  return (
    <div className={styles.albumInfo}>
      <div className={styles.albumInfoDate}>
        <span className={styles.dateBadge}>{formattedStartDate} ～ {formattedEndDate}</span>
        {isEditable && (
          <IconButton size="small" variant="outlined" onClick={onEditDateRangeButtonClick}>
            <Icon icon="edit-calendar" />
          </IconButton>
        )}
      </div>
      <input
        className={styles.albumTitleInput}
        type="text"
        value={name}
        placeholder="新規アルバム"
        readOnly={!isEditable}
        onChange={handleChange}
      />
      <div style={{ height: "4rem" }} />
    </div>
  )
}