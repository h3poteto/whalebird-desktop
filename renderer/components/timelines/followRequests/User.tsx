import emojify from '@/utils/emojify'
import { Avatar } from '@material-tailwind/react'
import { Entity, MegalodonInterface } from 'megalodon'
import { useRouter } from 'next/router'
import { FaCheck, FaXmark } from 'react-icons/fa6'
import { useIntl } from 'react-intl'

type Props = {
  user: Entity.Account | Entity.FollowRequest
  client: MegalodonInterface
  refresh: () => Promise<void>
}

export default function User(props: Props) {
  const router = useRouter()
  const { formatMessage } = useIntl()

  const openUser = (id: string) => {
    router.push({ query: { id: router.query.id, timeline: router.query.timeline, user_id: id, detail: true } })
  }

  const authorize = async () => {
    await props.client.acceptFollowRequest(`${props.user.id}`)
    await props.refresh()
  }

  const reject = async () => {
    await props.client.rejectFollowRequest(`${props.user.id}`)
    await props.refresh()
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mr-2 p-1">
      <div className="flex justify-between">
        <div className="flex" onClick={() => openUser(`${props.user.id}`)}>
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
        <div className="flex gap-4">
          <button title={formatMessage({ id: 'follow_requests.authorize' })} onClick={authorize}>
            <FaCheck />
          </button>
          <button title={formatMessage({ id: 'follow_requests.reject' })} onClick={reject}>
            <FaXmark />
          </button>
        </div>
      </div>
    </div>
  )
}
