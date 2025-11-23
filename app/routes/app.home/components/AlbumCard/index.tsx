import type { HTMLAttributes } from "react"
import { mergeProps } from "react-aria"
import { Link } from "react-router"
import styles from "./styles.module.css"
import { ThumbGrid } from "~/components/ThumbGrid"
import type { AlbumWithPhotosSchemaType } from "~/schemas/album"
import formatRelativeDate from "~/utils/formatRelativeDate"
import now from "~/utils/now"

type AlbumCardProps =  HTMLAttributes<HTMLElement> & {
  album: AlbumWithPhotosSchemaType
}

export function AlbumCard({ album, ...props }: AlbumCardProps) {
  const mergedProps = mergeProps<HTMLAttributes<HTMLElement>[]>({ className: styles.albumCard }, props)
  const startDate = formatRelativeDate(album.startDate, now)
  const endDate = formatRelativeDate(album.endDate, album.startDate)
  const dateRange = album.startDate === album.endDate? startDate : `${startDate} ～ ${endDate}`.replaceAll("/", " / ")

  return (
    <article {...mergedProps}>
      <ThumbGrid.Root className={styles.albumCardThumbnails}>
        {album.photos.slice(0, 4).map(photo => (
          <ThumbGrid.Item src={photo.src} alt="" key={photo.id} />
        ))}
      </ThumbGrid.Root>
      <div className={styles.albumCardContent}>
        <div className={styles.albumCardDateChip}>{dateRange}</div>
        <h2 className={styles.albumCardTitle}>{album.name}</h2>
      </div>
      <Link className={styles.albumCardLink} to={`/app/album/${album.id}`} />
    </article>
  )
}