import { Entity } from 'megalodon'
import { FaUserPlus } from 'react-icons/fa6'
import { FormattedMessage, useIntl } from 'react-intl'
import emojify from '@/utils/emojify'
import { Avatar } from '@material-tailwind/react'
import { useRouter } from 'next/router'

type Props = {
  notification: Entity.Notification
}

export default function Follow(props: Props) {
  const { formatMessage } = useIntl()
  const router = useRouter()

  const openUser = (id: string) => {
    router.push({ query: { id: router.query.id, timeline: router.query.timeline, user_id: id, detail: true } })
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 mr-2 py-1">
      <div className="flex items-center">
        <div style={{ width: '56px' }}>
          <FaUserPlus className="text-blue-600 w-4 mr-2 ml-auto" />
        </div>
        <div
          className="cursor-pointer text-gray-950 dark:text-gray-300"
          style={{ width: 'calc(100% - 56px)' }}
          onClick={() => openUser(props.notification.account.id)}
        >
          <span
            dangerouslySetInnerHTML={{
              __html: emojify(
                formatMessage(
                  {
                    id: actionId(props.notification)
                  },
                  { user: props.notification.account.username }
                ),
                props.notification.account.emojis
              )
            }}
          />
        </div>
      </div>
      <div className="flex">
        <div className="p-2 cursor-pointer" style={{ width: '56px' }}>
          <Avatar
            src={props.notification.account.avatar}
            onClick={() => openUser(props.notification.account.id)}
            variant="rounded"
            style={{ width: '40px', height: '40px' }}
            alt={formatMessage({ id: 'timeline.status.avatar' }, { user: props.notification.account.username })}
          />
        </div>
        <div style={{ width: 'calc(100% - 56px)' }}>
          <div className="flex cursor-pointer" onClick={() => openUser(props.notification.account.id)}>
            <span
              className="text-gray-950 dark:text-gray-300 text-ellipsis break-all overflow-hidden"
              dangerouslySetInnerHTML={{ __html: emojify(props.notification.account.display_name, props.notification.account.emojis) }}
            ></span>
            <span className="text-gray-600 dark:text-gray-500 text-ellipsis break-all overflow-hidden">
              @{props.notification.account.acct}
            </span>
          </div>
          <div className="text-gray-600 dark:text-gray-500">
            <FormattedMessage id="notification.follow.followers" values={{ num: props.notification.account.followers_count }} />
          </div>
        </div>
      </div>
    </div>
  )
}

const actionId = (notification: Entity.Notification) => {
  if (notification.type === 'follow_request') {
    return 'notification.follow_request.body'
  } else {
    return 'notification.follow.body'
  }
}
