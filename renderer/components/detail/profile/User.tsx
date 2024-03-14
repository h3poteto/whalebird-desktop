import emojify from '@/utils/emojify'
import { Avatar } from '@material-tailwind/react'
import { Entity } from 'megalodon'
import { useRouter } from 'next/router'

type Props = {
  user: Entity.Account
}

export default function User(props: Props) {
  const router = useRouter()

  const openUser = (id: string) => {
    router.push({ query: { id: router.query.id, timeline: router.query.timeline, user_id: id, detail: true } })
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mr-2 py-1">
      <div className="flex" onClick={() => openUser(props.user.id)}>
        <div className="p2 cursor-pointer" style={{ width: '56px' }}>
          <Avatar src={props.user.avatar} />
        </div>
        <div>
          <p
            className="text-gray-800 dark:text-gray-200"
            dangerouslySetInnerHTML={{ __html: emojify(props.user.display_name, props.user.emojis) }}
          />
          <p className="text-gray-500">@{props.user.acct}</p>
        </div>
      </div>
    </div>
  )
}
