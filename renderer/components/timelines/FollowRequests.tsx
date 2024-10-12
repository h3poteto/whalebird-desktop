import { Entity, MegalodonInterface } from 'megalodon'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import User from './followRequests/User'
import Detail from '../detail/Detail'
import { Account } from '@/db'
import { useUnreads } from '@/provider/unreads'

type Props = {
  client: MegalodonInterface
  account: Account
  openMedia: (media: Array<Entity.Attachment>, index: number) => void
}

export default function FollowRequests(props: Props) {
  const router = useRouter()
  const { setUnreads } = useUnreads()
  const [requests, setRequests] = useState<Array<Entity.FollowRequest | Entity.Account>>([])

  useEffect(() => {
    refreshRequests()
  }, [])

  const refreshRequests = async () => {
    const res = await props.client.getFollowRequests()
    setRequests(res.data)
    return res.data
  }

  const updateUnreads = (length: number) => {
    setUnreads(current =>
      Object.assign({}, current, {
        [`${props.account.id?.toString()}_follow_requests`]: length
      })
    )
  }

  const timelineClass = () => {
    if (router.query.detail) {
      return 'timeline-with-drawer'
    }
    return 'timeline'
  }

  return (
    <>
      <div className="flex timeline-wrapper">
        <section className={`h-full ${timelineClass()}`}>
          <div className="w-full theme-bg theme-text-primary p-2 flex justify-between">
            <div className="text-lg font-bold cursor-pointer">
              <FormattedMessage id="timeline.follow_requests" />
            </div>
          </div>
          <div className="timeline overflow-y-auto w-full overflow-x-hidden" style={{ height: 'calc(100% - 44px)' }}>
            {requests.map(r => (
              <>
                <User
                  key={r.id}
                  user={r}
                  client={props.client}
                  refresh={async () => {
                    const data = await refreshRequests()
                    updateUnreads(data.length)
                  }}
                />
              </>
            ))}
          </div>
        </section>
        <Detail client={props.client} account={props.account} className="detail" openMedia={props.openMedia} />
      </div>
    </>
  )
}
