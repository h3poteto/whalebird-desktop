import { Avatar, Spinner } from '@material-tailwind/react'
import { Entity, MegalodonInterface } from 'megalodon'
import emojify from '@/utils/emojify'
import { Virtuoso } from 'react-virtuoso'
import { useRouter } from 'next/router'

type Props = {
  client: MegalodonInterface
  users: Array<Entity.Account>
  loading: boolean
}

export default function Accounts(props: Props) {
  const router = useRouter()

  const openUser = (id: string) => {
    router.push({ query: { id: router.query.id, timeline: router.query.timeline, user_id: id, detail: true } })
  }

  return (
    <>
      <div className="overflow-x-hidden h-full w-full">
        {props.users.length > 0 ? (
          <Virtuoso
            style={{ height: 'calc(100vh - 64px)' }}
            data={props.users}
            className="timeline-scrollable"
            itemContent={(index, user) => <User key={index} user={user} openUser={openUser} />}
          />
        ) : (
          <>
            {props.loading && (
              <div className="py-4">
                <Spinner className="m-auto" />
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

type UserProps = {
  user: Entity.Account
  openUser: (id: string) => void
}

function User(props: UserProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mr-2 py-1">
      <div className="flex" onClick={() => props.openUser(props.user.id)}>
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
