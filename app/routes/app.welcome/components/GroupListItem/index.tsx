import { DummyImage } from "~/components/DummyImage"
import styles from "./styles.module.css"
import type { UserSchemaType } from "~/lib/schema"
import { Avatar } from "~/components/Avatar"

export function GroupListItem({ thumbSrc, name, users, onClick }:{
  thumbSrc: string | null, name: string, users: UserSchemaType[], onClick: VoidFunction
}) {
  return (
    <li className={styles.groupListItem}>
      <button className={styles.groupListItemBody} type="button" onClick={onClick}>
        <div className={styles.groupListItemThumb}>
          {thumbSrc? (
            <img className={styles.groupListItemThumbImage} src={thumbSrc} alt="" />
          ) : (
            <DummyImage />
          )}
        </div>
        <div className={styles.groupListItemContent}>
          <div>
            {name}
          </div>
          <div>
            {users.map(user => (
              <Avatar className={styles.groupListItemUserIcon} name={user.name} image={user.image ?? undefined} key={user.id} />
            ))}
          </div>
        </div>
      </button>
    </li>
  )
}